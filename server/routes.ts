import { ObjectId } from "mongodb";

import { Router, getExpressRouter } from "./framework/router";

import { Household, LanguageAudio, Membership, Patron, Shift, Stock, Team, User, WebSession } from "./app";
import { BadValuesError } from "./concepts/errors";
import { HouseholdDoc } from "./concepts/household";
import { LanguageAudioDoc } from "./concepts/languageaudio";
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
    return { id: orgI, name: org.name, admins: admins, members: members, openDays: org.openDays, restockDay: org.restockDay };
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

  @Router.patch("/organization/days/open/:id")
  async updateOpenDays(session: WebSessionDoc, id: ObjectId, days: Array<number>) {
    const user = WebSession.getUser(session);
    const orgId = new ObjectId(id);
    const openDays = new Array<number>;
    for(let day of days) openDays.push(day);
    openDays.sort();
    Team.updateOpenDays(orgId,openDays,user);
    return { msg: "Successfully updated open days" };
  }

  @Router.patch("/organization/days/restock/:id")
  async updateRestockDay(session: WebSessionDoc, id: ObjectId, day: number) {
    const user = WebSession.getUser(session);
    const orgId = new ObjectId(id);
    Team.updateRestockDay(orgId,day,user);
    return { msg: "Successfully updated restock day" };
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
  async createHouseholdProfile(session: WebSessionDoc, orgId: ObjectId, patrons: Array<[string, string, string]>, diet: Array<string>, lang: string, req: string) {
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
  @Router.patch("/profile")
  async updateHouseholdDetails(session: WebSessionDoc, id: ObjectId, update: Partial<HouseholdDoc>) {
    const household = await Household.getProfileById(id);
    const ID = new ObjectId(id);
    const user = WebSession.getUser(session);
    await Team.isTeamMember(household.organization, user);
    return await Household.update(ID, update);
  }

  @Router.patch("/profile/addPatron")
  async addPatronToHousehold(session: WebSessionDoc, id: ObjectId, name: string, birthday: string, img: string) {
    const user = WebSession.getUser(session);
    const ID = new ObjectId(id);
    const household = await Household.getProfileById(ID);
    await Team.isTeamMember(household.organization, user);
    const patron = (await Patron.create(name, birthday, img)).patron;
    return await Household.addMember(ID, patron._id);
  }

  @Router.patch("/profile/removePatron")
  async removePatronFromHousehold(session: WebSessionDoc, patrons: Array<string>, household: ObjectId) {
    const user = WebSession.getUser(session);
    const householdId = new ObjectId(household);
    const householdInfo = await Household.getProfileById(householdId);
    const patronId = patrons.map((patron) => new ObjectId(patron));
    await Team.isTeamMember(householdInfo.organization, user);
    const removePatrons = new Set(patrons);
    const updatedMembers = householdInfo.members.filter((member) => !removePatrons.has(member.toString()));
    await Household.updateMembers(householdId, updatedMembers);
    await Promise.all(patronId.map((patron) => Patron.deletePatron(patron)));
    return { msg: "Successfully updated Household" };
  }

  @Router.patch("/profile/updatePatron")
  async updatePatron(session: WebSessionDoc, household: ObjectId, patron: ObjectId, update: Partial<PatronDoc>) {
    const householdId = new ObjectId(household);
    const patronId = new ObjectId(patron);
    const householdInfo = await Household.getProfileById(householdId);
    const user = WebSession.getUser(session);
    await Team.isTeamMember(householdInfo.organization, user);
    return await Patron.updatePatron(patronId, update);
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
  async getSingleHousehold(session: WebSessionDoc, id: ObjectId) {
    const householdId = new ObjectId(id);
    const household = await Household.getProfileById(householdId);
    const user = WebSession.getUser(session);
    await Team.isTeamMember(household.organization, user);
    return { ...household, members: await Patron.getPatrons(household.members) };
  }

  @Router.get("/profile/org/:orgId")
  async getHouseholdsByOrg(session: WebSessionDoc, orgId: ObjectId) {
    const id = new ObjectId(orgId);
    const user = WebSession.getUser(session);
    await Team.isTeamMember(id, user);
    const allHouseholds = await Household.getProfilesByOwner(id);
    const patrons = await Promise.all(allHouseholds.map((household) => Patron.getPatrons(household.members)));
    return allHouseholds.map((household, idx) => {
      return { ...household, members: patrons[idx] };
    });
  }

  @Router.patch("/profile/visit/:id")
  async addVisit(session: WebSessionDoc, id: ObjectId) {
    const orgId = new ObjectId(id);
    const household = await Household.getProfileById(orgId);
    const user = WebSession.getUser(session);
    await Team.isTeamMember(household.organization, user);
    await Household.addVisit(orgId);
    return { msg: "Successfully added visit!" };
  }

  @Router.delete("/profile/:id")
  async removeHouseholdProfile(session: WebSessionDoc, id: ObjectId) {
    const orgId = new ObjectId(id);
    const household = await Household.getProfileById(orgId);
    const user = WebSession.getUser(session);
    await Team.isTeamMember(household.organization, user);
    for (const patron of household.members) {
      await Patron.deletePatron(patron);
    }
    return await Household.delete(orgId);
  }

  @Router.get("/profile/allocate/:id")
  async getHouseholdAllocation(session: WebSessionDoc, id: ObjectId) {
    const ID = new ObjectId(id);
    const household = await Household.getProfileById(ID);
    const user = WebSession.getUser(session);
    const team = household.organization;
    await Team.isTeamMember(team, user);
    const inventory = await Stock.getStocksByOwner(team);
    const allocation = new Array<StockDoc>();
    const diet = household.dietaryRestrictions;
    for (const stock of inventory) {
      let canBeGiven = true;
      for (const restriction of diet) {
        let found = false;
        for (const compare of stock.diet)
          if (restriction.valueOf() === compare.valueOf()) {
            found = true;
            break;
          }
        if (found) {
          canBeGiven = false;
          break;
        }
      }
      if (canBeGiven) allocation.push(stock);
    }
    const maxPer = new Array<number>();
    allocation.forEach((stock) => {
      maxPer.push(Math.min(stock.maxPerPerson, stock.maxPerDay));
    });
    const response = await Responses.stocks(allocation);
    const ret = response.map((stock, i) => ({ ...stock, allocation: maxPer[i] }));
    return ret;
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
      return await Responses.stock(inventory);
    } else {
      inventory = await Stock.getStocksByOwner(org);
      const response = await Responses.stocks(inventory);
      return response;
    }
  }

  // generate max per day allocation
  @Router.get("/inventories/:orgId")
  async setInventoryMaxPerDay(session: WebSessionDoc, orgId: ObjectId) {
    const user = WebSession.getUser(session);
    const org = new ObjectId(orgId);
    await Team.isTeamMember(org, user);
    const team = await Team.get(org);
    const inventory = await Stock.getStocksByOwner(org);
    const openDays = team.openDays;
    const restockDay = team.restockDay;
    const currentDate = new Date();
    let days = currentDate.getDay()-restockDay;
    if(days<0)days+=7;
    let cnt=0,day=restockDay,dayCount=0;
    while(cnt<days)
    {
      if(openDays.includes(day))
        dayCount++;
      cnt++;
      day=(day+1)%7;
    }
    await Promise.all(inventory.map((stock) => Stock.setTodaysAllocation(stock._id,Math.floor(stock.count/(openDays.length-dayCount)))));
    return { msg: "Inventory max per day successfully set!" };
  }

  // update an inventory item's count or other details (link, image, etc)
  @Router.patch("/inventory/:id")
  async updateInventoryItem(session: WebSessionDoc, id: ObjectId, update: Partial<StockDoc>) {
    const user = WebSession.getUser(session);
    const ID = new ObjectId(id);
    const stock = await Stock.getStockById(ID);
    await Team.isTeamMember(stock.owner, user);
    // eslint-disable-next-line
    const { count, ...rest } = update; // remove count
    await Stock.updateStockDetails(ID, update);
    return { msg: "Stock successfully updated!" };
  }

  // update an inventory item's count or other details (link, image, etc)
  @Router.patch("/inventories/allocate")
  async decrementInventoryItem(session: WebSessionDoc, id: ObjectId, update: Partial<StockDoc>) {
    const user = WebSession.getUser(session);
    console.log(id);
    console.log(update);
    const ID = new ObjectId(id);
    const stock = await Stock.getStockById(ID);
    await Team.isTeamMember(stock.owner, user);
    if (update.count) {
      await Stock.updateStockQuantity(ID, update.count);
    }
    return { msg: "Stock successfully updated!" };
  }

  @Router.post("/inventory")
  async addNewInventoryItem(session: WebSessionDoc, owner: ObjectId, item: string, count: number, diet: Array<string>, link?: string, img?: string, maxp?: number) {
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
  async getOrganizationShifts(session: WebSessionDoc, orgId: ObjectId, futureOnly: string) {
    const futureOnlyBool = futureOnly === "true";
    const user = WebSession.getUser(session);
    await Team.isTeamMember(orgId, user);
    let shifts;
    if (futureOnlyBool) {
      shifts = await Shift.getFutureShiftsByOwner(orgId);
    } else {
      shifts = await Shift.getShiftsByOwner(orgId);
    }
    return Responses.shifts(shifts);
  }

  @Router.get("/shift/user/:futureOnly")
  async getUserShifts(session: WebSessionDoc, futureOnly: string) {
    const futureOnlyBool = futureOnly === "true";
    const user = WebSession.getUser(session);
    let shifts;
    if (futureOnlyBool) {
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

  @Router.patch("/shift")
  async updateShift(session: WebSessionDoc, id: ObjectId, start: string, end: string) {
    const user = WebSession.getUser(session);
    const shift = await Shift.getShiftById(id);
    await Team.isAdmin(shift.owner, user);
    return await Shift.updateShiftTime(id, new Date(start), new Date(end));
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

  @Router.post("/languageAudio")
  async createLanguageAudio(session: WebSessionDoc, org: ObjectId, language: string, audio: string, translation: string) {
    const user = WebSession.getUser(session);
    const orgId = new ObjectId(org);
    await Team.isTeamMember(orgId, user);
    return await LanguageAudio.create(orgId, language, audio, translation);
  }

  @Router.get("/languageAudio/owner/:org/allLanguages")
  async getLanguageAudioByOwner(session: WebSessionDoc, org: ObjectId) {
    const user = WebSession.getUser(session);
    const orgId = new ObjectId(org);
    await Team.isTeamMember(orgId, user);
    const allLanguage = await LanguageAudio.getAllAudioLanguagesByOwner(orgId);
    const allAudio = await Promise.all(allLanguage.map((language) => LanguageAudio.getAudioLanguagesByOwner(orgId, language)));
    return allAudio.map((audio, idx) => {
      return { language: allLanguage[idx], audios: audio };
    });
  }

  @Router.get("/languageAudio/owner/:org/:language")
  async getLanguageAudioByOwnerAndLanguage(session: WebSessionDoc, org: ObjectId, language: string) {
    const user = WebSession.getUser(session);
    const orgId = new ObjectId(org);
    await Team.isTeamMember(orgId, user);
    return { language: language, audios: await LanguageAudio.getAudioLanguagesByOwner(orgId, language) };
  }

  @Router.get("/languageAudio/:audio")
  async getLanguageAudioById(session: WebSessionDoc, audio: ObjectId) {
    const user = WebSession.getUser(session);
    const audioId = new ObjectId(audio);
    const languageAudio = await LanguageAudio.getById(audioId);
    await Team.isTeamMember(languageAudio.owner, user);
    return languageAudio;
  }

  @Router.patch("/languageAudio")
  async updateLanguageAudio(session: WebSessionDoc, audio: ObjectId, update: Partial<LanguageAudioDoc>) {
    const user = WebSession.getUser(session);
    const audioId = new ObjectId(audio);
    const audioFile = await LanguageAudio.getById(audioId);
    await Team.isTeamMember(audioFile.owner, user);
    return await LanguageAudio.updateAudio(audioId, audioFile.owner, update);
  }

  @Router.delete("/languageAudio/:audio")
  async deleteLanguageAudio(session: WebSessionDoc, audio: ObjectId) {
    const user = WebSession.getUser(session);
    const audioId = new ObjectId(audio);
    const audioFile = await LanguageAudio.getById(audioId);
    await Team.isTeamMember(audioFile.owner, user);
    return await LanguageAudio.deleteAudio(audioId, audioFile.owner);
  }
}

export default getExpressRouter(new Routes());
