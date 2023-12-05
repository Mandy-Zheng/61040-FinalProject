import { ObjectId } from "mongodb";

import { Router, getExpressRouter } from "./framework/router";

import { Household, Membership, Patron, Shift, Stock, Team, User, WebSession } from "./app";
import { BadValuesError } from "./concepts/errors";
import { DietaryRestrictions, HouseholdDoc, Language } from "./concepts/household";
import { PatronDoc } from "./concepts/patron";
import { StockDoc } from "./concepts/stock";
import { UserDoc } from "./concepts/user";
import { WebSessionDoc } from "./concepts/websession";
import Responses from "./responses";
class Routes {
  @Router.get("/session")
  async getSessionUser(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    return await User.getUserById(user);
  }

  @Router.get("/users")
  async getUsers() {
    return await User.getUsers();
  }

  @Router.get("/users/:username")
  async getUser(username: string) {
    return await User.getUserByUsername(username);
  }

  @Router.post("/users")
  async registerUser(session: WebSessionDoc, username: string, password: string) {
    WebSession.isLoggedOut(session);
    const { msg, user } = await User.create(username, password);
    if (user) {
      await Membership.create(user._id);
    }
    return { msg, user };
  }

  @Router.patch("/users")
  async updateUser(session: WebSessionDoc, update: Partial<UserDoc>) {
    const user = WebSession.getUser(session);
    return await User.update(user, update);
  }

  @Router.delete("/users")
  async deleteUser(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    WebSession.end(session);
    const msg = await User.delete(user);
    const { organizations } = await Membership.get(user);
    for (const orgId of organizations) {
      const oldTeam = await Team.get(orgId);
      if (oldTeam.admins.length === 1 && oldTeam.admins[0].toString() === user.toString()) {
        await Team.delete(orgId, user);
        await Promise.all(oldTeam.members.map((member) => Membership.removeMembership(member, orgId)));
      } else {
        await Team.removeUsersFromTeam(orgId, [user], user);
      }
    }
    await Membership.deleteUserMembership(user);
    await Shift.unclaimShiftsByUser(user);
    return msg;
  }

  @Router.post("/login")
  async logIn(session: WebSessionDoc, username: string, password: string) {
    const u = await User.authenticate(username, password);
    WebSession.start(session, u._id);
    return { msg: "Logged in!" };
  }

  @Router.post("/logout")
  async logOut(session: WebSessionDoc) {
    WebSession.end(session);
    return { msg: "Logged out!" };
  }

  @Router.post("/organization")
  async registerOrganization(session: WebSessionDoc, name: string) {
    const user = WebSession.getUser(session);
    const { msg, team } = await Team.create(name, user);
    if (team) {
      await Membership.addMembership(user, team._id);
    }
    return { msg: msg, team: team };
  }

  @Router.get("/organization/:orgId")
  async getOrganizationById(session: WebSessionDoc, orgId: ObjectId) {
    const orgI = new ObjectId(orgId);
    const org = await Team.get(orgI);
    const admins = await User.idsToUsernames(org.admins);
    const members = await User.idsToUsernames(org.members);
    return { id: orgI, name: org.name, admins: admins, members: members };
  }

  @Router.get("/organization")
  async getOrganizationsOfUser(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    const { organizations } = await Membership.get(user);
    const allOrgs = await Promise.all(organizations.map((id) => Team.get(id)));
    return allOrgs.map((org) => {
      const isAdmin = org.admins.some((a) => a.toString() === user.toString());
      return { id: org._id, name: org.name, isAdmin: isAdmin };
    });
  }

  @Router.patch("/organization")
  async updateOrganizationName(session: WebSessionDoc, orgId: ObjectId, orgName: string) {
    const user = WebSession.getUser(session);
    const org = new ObjectId(orgId);
    if (!orgName) {
      throw new BadValuesError("Missing Organization Name");
    }
    return await Team.updateName(org, orgName, user);
  }

  @Router.patch("/organization/addMember")
  async addMembersToOrganization(session: WebSessionDoc, orgId: ObjectId, newMembers: Array<string>) {
    const user = WebSession.getUser(session);
    const org = new ObjectId(orgId);
    const memberIds = newMembers.map((member) => new ObjectId(member));
    await Team.addUsersAsMembers(org, memberIds, user);
    await Promise.all(memberIds.map((member) => Membership.addMembership(member, org)));
    return { msg: "Successfully Added Members To Organization!" };
  }

  @Router.patch("/organization/updateMember")
  async updateMemberStatus(session: WebSessionDoc, orgId: ObjectId, member: ObjectId, isPromoting: Boolean) {
    const user = WebSession.getUser(session);
    const org = new ObjectId(orgId);
    const memberId = new ObjectId(member);
    await Team.isTeamMember(org, memberId);
    if (isPromoting) {
      return Team.addUsersAsAdmins(org, [memberId], user);
    } else {
      return Team.addUsersAsMembers(org, [memberId], user);
    }
  }

  @Router.patch("/organization/leaveOrganization")
  async leaveOrganization(session: WebSessionDoc, orgId: ObjectId) {
    const user = WebSession.getUser(session);
    const id = new ObjectId(orgId);
    const shiftsWithOrg = (await Shift.getShiftsByUser(user)).filter((s) => s.owner.toString() === orgId.toString());
    shiftsWithOrg.forEach((s) => Shift.unclaimShift(s._id, user));
    await Team.removeUsersFromTeam(orgId, [user], user);
    await Membership.removeMembership(user, id);
    return { msg: "Successfully left organization" };
  }

  @Router.patch("/organization/removeMember")
  async removeUserFromOrganization(session: WebSessionDoc, orgId: ObjectId, member: ObjectId) {
    const user = WebSession.getUser(session);
    const id = new ObjectId(orgId);
    const memberId = new ObjectId(member);
    const shiftsWithOrg = (await Shift.getShiftsByUser(member)).filter((s) => s.owner.toString() === orgId.toString());
    shiftsWithOrg.forEach((s) => Shift.unclaimShift(s._id, member));
    const msg = await Team.removeUsersFromTeam(id, [memberId], user);
    await Membership.removeMembership(memberId, id);
    return msg;
  }

  @Router.delete("/organization/:orgId")
  async deleteOrganization(session: WebSessionDoc, orgId: ObjectId) {
    const user = WebSession.getUser(session);
    const org = new ObjectId(orgId);
    await Team.isAdmin(org, user);
    const { admins, members } = await Team.get(org);
    const allMembers = members.concat(admins);
    await Shift.deleteShiftsByOwner(orgId);
    await Promise.all(allMembers.map((member) => Membership.removeMembership(member, org)));
    return Team.delete(org, user);
  }

  // reset all visits for all households in organization
  @Router.patch("/organization/reset/:orgId")
  async resetAllVisits(session: WebSessionDoc, orgId: ObjectId) {
    const user = WebSession.getUser(session);
    const org = new ObjectId(orgId);
    await Team.isAdmin(org, user);
    const households = await Household.getProfilesByOwner(org);
    for (const h of households) {
      await Household.resetVisits(h._id);
    }
    return { msg: "Successfully reset all visits!" };
  }

  @Router.post("/profile")
  async createHouseholdProfile(session: WebSessionDoc, orgId: ObjectId, patrons: Array<[string, string, string]>, diet: Array<DietaryRestrictions>, lang: Language, req: string) {
    const user = WebSession.getUser(session);
    const org = new ObjectId(orgId);
    await Team.isTeamMember(org, user);
    const info = await Promise.all(patrons.map((patron) => Patron.create(patron[0], patron[1], patron[2])));
    return await Household.create(
      org,
      info.map((patron) => patron.patron._id),
      diet,
      lang,
      req,
    );
  }

  // update household members, diet restrictions, language, special requests
  @Router.patch("/profile/:id")
  async updateHouseholdDetails(session: WebSessionDoc, id: ObjectId, update: Partial<HouseholdDoc>) {
    const household = await Household.getProfileById(id);
    const ID = new ObjectId(id);
    const user = WebSession.getUser(session);
    await Team.isTeamMember(household.organization, user);
    return await Household.update(ID, update);
  }

  @Router.patch("/profile/addPatron/:id")
  async addPatronToHousehold(session: WebSessionDoc, id: ObjectId, name: string, birthday: string, img: string) {
    const user = WebSession.getUser(session);
    const ID = new ObjectId(id);
    const household = await Household.getProfileById(ID);
    await Team.isTeamMember(household.organization, user);
    const patron = (await Patron.create(name, birthday, img)).patron;
    return await Household.addMember(ID, patron._id);
  }

  @Router.patch("/profile/removePatron/:id")
  async removePatronFromHousehold(session: WebSessionDoc, id: ObjectId, patronId: ObjectId) {
    const household = await Household.getProfileById(id);
    const ID = new ObjectId(id);
    const patron = new ObjectId(patronId);
    const user = WebSession.getUser(session);
    await Team.isTeamMember(household.organization, user);
    return await Household.removeMember(ID, patron);
  }

  @Router.patch("/profile/updatePatron/:id")
  async updatePatron(session: WebSessionDoc, id: ObjectId, patronId: ObjectId, update: Partial<PatronDoc>) {
    const ID = new ObjectId(id);
    const patron = new ObjectId(patronId);
    const household = await Household.getProfileById(ID);
    const user = WebSession.getUser(session);
    await Team.isTeamMember(household.organization, user);
    return await Patron.updatePatron(patron, update);
  }

  @Router.get("/patron/:id")
  async getPatronById(id: ObjectId) {
    const _id = new ObjectId(id);
    return await Patron.getPatronById(_id);
  }

  // return household
  @Router.get("/profile/:id")
  async signInHousehold(session: WebSessionDoc, id: ObjectId) {
    const ID = new ObjectId(id);
    const household = await Household.getProfileById(ID);
    const user = WebSession.getUser(session);
    await Team.isTeamMember(household.organization, user);
    return household;
  }

  // return household
  @Router.get("/profile/one/:id")
  async singleHousehold(session: WebSessionDoc, id: ObjectId) {
    const ID = new ObjectId(id);
    const household = await Household.getProfileById(ID);
    const user = WebSession.getUser(session);
    await Team.isTeamMember(household.organization, user);
    return [household];
  }

  @Router.get("/profile/org/:orgId")
  async getHouseholdsByOrg(session: WebSessionDoc, orgId: ObjectId) {
    const id = new ObjectId(orgId);
    const user = WebSession.getUser(session);
    await Team.isTeamMember(id, user);
    return await Household.getProfilesByOwner(id);
  }

  @Router.patch("/profile/visit/:id")
  async addVisit(session: WebSessionDoc, id: ObjectId) {
    const ID = new ObjectId(id);
    const household = await Household.getProfileById(ID);
    const user = WebSession.getUser(session);
    await Team.isTeamMember(household.organization, user);
    await Household.addVisit(ID);
  }

  @Router.delete("/profile/:id")
  async removeHouseholdProfile(session: WebSessionDoc, id: ObjectId) {
    const ID = new ObjectId(id);
    const household = await Household.getProfileById(ID);
    const user = WebSession.getUser(session);
    await Team.isTeamMember(household.organization, user);
    for (const patron of household.members) {
      await Patron.deletePatron(patron);
    }
    return await Household.delete(ID);
  }

  @Router.get("/inventory/stocks/:stockId")
  async getItem(session: WebSessionDoc, stockId: string) {
    WebSession.getUser(session);
    return await Stock.getStockById(new ObjectId(stockId));
  }

  // return inventory of given organization, including the max per day allocation
  @Router.get("/inventory/:orgId")
  async getOrganizationInventory(session: WebSessionDoc, orgId: ObjectId, name?: string) {
    const user = WebSession.getUser(session);
    const org = new ObjectId(orgId);
    await Team.isTeamMember(org, user);
    let inventory;
    if (name) {
      inventory = await Stock.getStockByItem(org, name);
      return { ...(await Responses.stock(inventory)), maxPerDay: Stock.getTodaysAllocation(inventory.count) };
    } else {
      inventory = await Stock.getStocksByOwner(org);
      const maxPDs = inventory.map((stock) => Stock.getTodaysAllocation(stock.count));
      const response = await Responses.stocks(inventory);
      return response.map((stock, i) => ({ ...stock, maxPerDay: maxPDs[i] }));
    }
  }

  // update an inventory item's count or other details (link, image, etc)
  @Router.patch("/inventory/:id")
  async updateInventoryItem(session: WebSessionDoc, id: ObjectId, update: Partial<StockDoc>) {
    const user = WebSession.getUser(session);
    const ID = new ObjectId(id);
    const stock = await Stock.getStockById(ID);
    await Team.isTeamMember(stock.owner, user);
    if (update.count) {
      await Stock.updateStockQuantity(ID, update.count);
    }
    // eslint-disable-next-line
    const { count, ...rest } = update; // remove count
    await Stock.updateStockDetails(ID, rest);
    return { msg: "Stock successfully updated!" };
  }

  @Router.post("/inventory")
  async addNewInventoryItem(session: WebSessionDoc, owner: ObjectId, item: string, count: number, diet: Array<DietaryRestrictions>, link?: string, img?: string, maxp?: number) {
    const user = WebSession.getUser(session);
    const Owner = new ObjectId(owner);
    await Team.isTeamMember(Owner, user);
    return await Stock.createStock(Owner, item, count, diet, link, img, maxp);
  }

  @Router.delete("/inventory/:id")
  async deleteInventoryItem(session: WebSessionDoc, id: ObjectId) {
    const user = WebSession.getUser(session);
    const ID = new ObjectId(id);
    const stock = await Stock.getStockById(ID);
    await Team.isTeamMember(stock.owner, user);
    return await Stock.deleteStock(ID);
  }

  @Router.get("/shift/org/:orgId/:futureOnly")
  async getOrganizationShifts(session: WebSessionDoc, orgId: ObjectId, futureOnly: Boolean) {
    const user = WebSession.getUser(session);
    await Team.isTeamMember(orgId, user);
    let shifts;
    if (futureOnly) {
      shifts = await Shift.getFutureShiftsByOwner(orgId);
    } else {
      shifts = await Shift.getShiftsByOwner(orgId);
    }
    return Responses.shifts(shifts);
  }

  @Router.get("/shift/user/:futureOnly")
  async getUserShifts(session: WebSessionDoc, futureOnly: Boolean) {
    const user = WebSession.getUser(session);
    let shifts;
    if (futureOnly) {
      shifts = await Shift.getFutureShiftsByUser(user);
    } else {
      shifts = await Shift.getShiftsByUser(user);
    }
    return Responses.shifts(shifts);
  }

  @Router.post("/shift")
  async createNewShift(session: WebSessionDoc, orgId: ObjectId, start: string, end: string) {
    const user = WebSession.getUser(session);
    await Team.isAdmin(orgId, user);
    const created = await Shift.createShift(orgId, new Date(start), new Date(end));
    return { msg: created.msg, shift: Responses.shift(created.shift) };
  }

  @Router.patch("/shift/claim/:id")
  async claimShift(session: WebSessionDoc, id: ObjectId) {
    const user = WebSession.getUser(session);
    const shift = await Shift.getShiftById(id);
    await Team.isTeamMember(shift.owner, user);
    return await Shift.claimShift(id, user);
  }

  @Router.patch("/shift/unclaim/:id")
  async unclaimShift(session: WebSessionDoc, id: ObjectId) {
    const user = WebSession.getUser(session);
    const shift = await Shift.getShiftById(id);
    await Team.isTeamMember(shift.owner, user);
    return await Shift.unclaimShift(id, user);
  }

  @Router.delete("/shift/:id")
  async deleteShift(session: WebSessionDoc, id: ObjectId) {
    const user = WebSession.getUser(session);
    const shift = await Shift.getShiftById(id);
    await Team.isAdmin(shift.owner, user);
    return await Shift.deleteShift(id);
  }
}

export default getExpressRouter(new Routes());
