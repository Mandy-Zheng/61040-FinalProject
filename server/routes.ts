import { ObjectId } from "mongodb";

import { Router, getExpressRouter } from "./framework/router";

import { Membership, Stock, Team, User, WebSession } from "./app";
import { DietaryRestrictions } from "./concepts/household";
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
  async createUser(session: WebSessionDoc, username: string, password: string) {
    WebSession.isLoggedOut(session);
    return await User.create(username, password);
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

  @Router.post("/users/:id")
  async registerUser(session: WebSessionDoc, username: string, password: string) {
    WebSession.isLoggedOut(session);
    const { user, msg } = await User.create(username, password);
    let membership;
    if (user) {
      membership = await Membership.create(user._id);
    }
    return { msg, user, membership: membership?.membership };
  }

  @Router.post("/organization/:id")
  async registerOrganization(session: WebSessionDoc, orgName: string) {
    const user = WebSession.getUser(session);
    const { msg, team } = await Team.create(orgName, user);
    if (team) {
      await Membership.addMembership(user, team._id);
    }
    return { msg: msg, team: team };
  }

  @Router.patch("/organization/:id")
  async updateOrganizationName(session: WebSessionDoc, orgId: ObjectId, orgName: string) {
    const user = WebSession.getUser(session);
    return await Team.updateName(orgId, orgName, user);
  }

  @Router.patch("/organization/:id")
  async addMemberToOrganization(session: WebSessionDoc, orgId: ObjectId, newMember: ObjectId) {
    const user = WebSession.getUser(session);
    const addMsg = Team.addUserAsMember(orgId, newMember, user);
    await Membership.addMembership(newMember, orgId);
    return addMsg;
  }

  @Router.patch("/organization/:id")
  async updateMemberStatus(session: WebSessionDoc, orgId: ObjectId, member: ObjectId, isPromoting: Boolean) {
    const user = WebSession.getUser(session);
    await Team.isTeamMember(orgId, member);
    if (isPromoting) {
      return Team.addUserAsAdmin(orgId, member, user);
    } else {
      return Team.addUserAsMember(orgId, member, user);
    }
  }

  @Router.patch("/organization/:id")
  async removeUserFromOrganization(session: WebSessionDoc, orgId: ObjectId, member: ObjectId) {
    const user = WebSession.getUser(session);
    const msg = await Team.removeUserFromTeam(orgId, member, user);
    await Membership.removeMembership(member, orgId);
    return msg;
  }

  @Router.delete("/organization/:id")
  async deleteOrganization(session: WebSessionDoc, orgId: ObjectId) {
    const user = WebSession.getUser(session);
    const { admins, members } = await Team.get(orgId);
    const allMembers = members.concat(admins);
    await Promise.all(allMembers.map((member) => Membership.removeMembership(member, orgId)));
    return Team.delete(orgId, user);
  }

  // return inventory of given organization
  @Router.get("/inventory/:orgId")
  async getOrganizationInventory(session: WebSessionDoc, orgId: ObjectId, item?: string) {
    const user = WebSession.getUser(session);
    await !Team.isTeamMember(orgId, user);
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

  @Router.patch("/inventory")
  async updateInventoryItem(session: WebSessionDoc, id: ObjectId, update: Partial<StockDoc>) {
    const user = WebSession.getUser(session);
    const stock = await Stock.getStockById(id);
    await !Team.isTeamMember(stock.owner, user);
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
    await !Team.isTeamMember(owner, user);
    return await Stock.createStock(owner, item, count, diet, link, img, maxp);
  }

  @Router.delete("/inventory")
  async deleteInventoryItem(session: WebSessionDoc, id: ObjectId) {
    const user = WebSession.getUser(session);
    const stock = await Stock.getStockById(id);
    await !Team.isTeamMember(stock.owner, user);
    return await Stock.deleteStock(id);
  }
}

export default getExpressRouter(new Routes());
