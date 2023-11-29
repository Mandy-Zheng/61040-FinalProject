import { ObjectId } from "mongodb";

import { Router, getExpressRouter } from "./framework/router";

import { Household, Membership, Patron, Stock, Team, User, WebSession } from "./app";
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
    await Promise.all(organizations.map((orgId) => Team.removeUserFromTeam(orgId, user, user)));
    await Membership.deleteUserMembership(user);
    //Todo --> shifts
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

  @Router.get("/organization")
  async getOrganizationsOfUser(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    const { organizations } = await Membership.get(user);
    const allOrgs = await Promise.all(organizations.map((id) => Team.get(id)));
    const allAdmins = await Promise.all(allOrgs.map((org) => User.idsToUsernames(org.admins)));
    const allMembers = await Promise.all(allOrgs.map((org) => User.idsToUsernames(org.members)));
    console.log(allOrgs);
    return allOrgs.map((org, idx) => {
      return { id: org._id, name: org.name, admins: allAdmins[idx], members: allMembers[idx] };
    });
  }

  @Router.patch("/organization")
  async updateOrganizationName(session: WebSessionDoc, orgId: ObjectId, orgName: string) {
    const user = WebSession.getUser(session);
    if (!orgName) {
      throw new BadValuesError("Missing Organization Name");
    }
    return await Team.updateName(orgId, orgName, user);
  }

  @Router.patch("/organization/addMember")
  async addMembersToOrganization(session: WebSessionDoc, orgId: ObjectId, newMembers: Array<ObjectId>) {
    const user = WebSession.getUser(session);
    const addMsg = await Promise.all(newMembers.map((member) => Team.addUserAsMember(orgId, member, user)));
    await Promise.all(newMembers.map((member) => Membership.addMembership(member, orgId)));
    return addMsg;
  }

  @Router.patch("/organization/updateMember")
  async updateMemberStatus(session: WebSessionDoc, orgId: ObjectId, member: ObjectId, isPromoting: Boolean) {
    const user = WebSession.getUser(session);
    await Team.isTeamMember(orgId, member);
    if (isPromoting) {
      return Team.addUserAsAdmin(orgId, member, user);
    } else {
      return Team.addUserAsMember(orgId, member, user);
    }
  }

  @Router.patch("/organization/removeMember")
  async removeUserFromOrganization(session: WebSessionDoc, orgId: ObjectId, member: ObjectId) {
    const user = WebSession.getUser(session);
    const msg = await Team.removeUserFromTeam(orgId, member, user);
    await Membership.removeMembership(member, orgId);
    return msg;
    //todo decide what to do if all admins leave?
  }

  @Router.delete("/organization")
  async deleteOrganization(session: WebSessionDoc, orgId: ObjectId) {
    const user = WebSession.getUser(session);
    await Team.isAdmin(orgId,user);
    const { admins, members } = await Team.get(orgId);
    const allMembers = members.concat(admins);
    await Promise.all(allMembers.map((member) => Membership.removeMembership(member, orgId)));
    return Team.delete(orgId, user);
  }

  // reset all visits for all households in organization
  @Router.patch("/organization/reset")
  async resetAllVisits(session: WebSessionDoc, orgId: ObjectId) {
    const user = WebSession.getUser(session);
    await Team.isAdmin(orgId, user);
    const households = await Household.getProfilesByOwner(orgId);
    for (const h of households) {
      await Household.resetVisits(h._id);
    }
    return { msg: "Successfully reset all visits!" };
  }

  @Router.post("/profile/:id")
  async createHouseholdProfile(session: WebSessionDoc, orgId: ObjectId, name: string, birthday: Date, img: string, diet: Array<DietaryRestrictions>, lang: Language, req: string) {
    const user = WebSession.getUser(session);
    await Team.isTeamMember(orgId, user);
    const patron = await Patron.create(name, birthday, img);
    return await Household.create(orgId, [patron.patron._id], diet, lang, req);
  }

  // update household members, diet restrictions, language, special requests
  @Router.patch("/profile/:id")
  async updateHouseholdDetails(session: WebSessionDoc, id: ObjectId, update: Partial<HouseholdDoc>) {
    const household = await Household.getProfileById(id);
    const user = WebSession.getUser(session);
    await Team.isTeamMember(household.organization, user);
    return await Household.update(id, update);
  }

  @Router.patch("/profile/addPatron/:id")
  async addPatronToHousehold(session: WebSessionDoc, id: ObjectId, name: string, birthday: string, img: string) {
    const user = WebSession.getUser(session);
    const household = await Household.getProfileById(id);
    await Team.isTeamMember(household.organization, user);
    const date = new Date(birthday);
    const patron = (await Patron.create(name, date, img)).patron;
    return await Household.addMember(id, patron._id);
  }

  @Router.patch("/profile/removePatron/:id")
  async removePatronFromHousehold(session: WebSessionDoc, id: ObjectId, patronId: ObjectId) {
    const household = await Household.getProfileById(id);
    const user = WebSession.getUser(session);
    await Team.isTeamMember(household.organization, user);
    return await Household.removeMember(id, patronId);
  }

  @Router.patch("/profile/updatePatron/:id")
  async updatePatron(session: WebSessionDoc, id: ObjectId, patronId: ObjectId, update: Partial<PatronDoc>) {
    const household = await Household.getProfileById(id);
    const user = WebSession.getUser(session);
    await Team.isTeamMember(household.organization, user);
    return await Patron.updatePatron(patronId, update);
  }

  // return household and add visit
  @Router.get("/profile/:id")
  async signInHousehold(session: WebSessionDoc, id: ObjectId) {
    const household = await Household.getProfileById(id);
    const user = WebSession.getUser(session);
    await Team.isTeamMember(household.organization, user);
    await Household.addVisit(id);
    return household;
  }

  @Router.delete("/profile/:id")
  async removeHouseholdProfile(session: WebSessionDoc, id: ObjectId) {
    const household = await Household.getProfileById(id);
    const user = WebSession.getUser(session);
    await Team.isTeamMember(household.organization, user);
    for (const patron of household.members) {
      await Patron.deletePatron(patron);
    }
    return await Household.delete(id);
  }

  // return inventory of given organization, including the max per day allocation
  @Router.get("/inventory/:orgId")
  async getOrganizationInventory(session: WebSessionDoc, orgId: ObjectId, item?: string) {
    const user = WebSession.getUser(session);
    await Team.isTeamMember(orgId, user);
    let inventory;
    if (item) {
      inventory = await Stock.getStockByItem(orgId, item);
      return { ...(await Responses.stock(inventory)), maxPerDay: Stock.getTodaysAllocation(inventory.count) };
    } else {
      inventory = await Stock.getStocksByOwner(orgId);
      const maxPDs = inventory.map((stock) => Stock.getTodaysAllocation(stock.count));
      const response = await Responses.stocks(inventory);
      return response.map((stock, i) => ({ ...stock, maxPerDay: maxPDs[i] }));
    }
  }

  // update an inventory item's count or other details (link, image, etc)
  @Router.patch("/inventory")
  async updateInventoryItem(session: WebSessionDoc, id: ObjectId, update: Partial<StockDoc>) {
    const user = WebSession.getUser(session);
    const stock = await Stock.getStockById(id);
    await Team.isTeamMember(stock.owner, user);
    if (update.count) {
      await Stock.updateStockQuantity(id, update.count);
    }
    // eslint-disable-next-line
    const { count, ...rest } = update; // remove count
    await Stock.updateStockDetails(id, rest);
    return { msg: "Stock successfully updated!" };
  }

  @Router.post("/inventory")
  async addNewInventoryItem(session: WebSessionDoc, owner: ObjectId, item: string, count: number, diet: Array<DietaryRestrictions>, link?: string, img?: string, maxp?: number) {
    const user = WebSession.getUser(session);
    await Team.isTeamMember(owner, user);
    return await Stock.createStock(owner, item, count, diet, link, img, maxp);
  }

  @Router.delete("/inventory")
  async deleteInventoryItem(session: WebSessionDoc, id: ObjectId) {
    const user = WebSession.getUser(session);
    const stock = await Stock.getStockById(id);
    await Team.isTeamMember(stock.owner, user);
    return await Stock.deleteStock(id);
  }
}

export default getExpressRouter(new Routes());
