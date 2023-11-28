import { ObjectId } from "mongodb";

import { Router, getExpressRouter } from "./framework/router";

import { Friend, Membership, Post, Stock, Team, User, WebSession } from "./app";
import { DietaryRestrictions } from "./concepts/household";
import { PostDoc, PostOptions } from "./concepts/post";
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
    return await User.delete(user);
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

  @Router.get("/posts")
  async getPosts(author?: string) {
    let posts;
    if (author) {
      const id = (await User.getUserByUsername(author))._id;
      posts = await Post.getByAuthor(id);
    } else {
      posts = await Post.getPosts({});
    }
    return Responses.posts(posts);
  }

  @Router.post("/posts")
  async createPost(session: WebSessionDoc, content: string, options?: PostOptions) {
    const user = WebSession.getUser(session);
    const created = await Post.create(user, content, options);
    return { msg: created.msg, post: await Responses.post(created.post) };
  }

  @Router.patch("/posts/:_id")
  async updatePost(session: WebSessionDoc, _id: ObjectId, update: Partial<PostDoc>) {
    const user = WebSession.getUser(session);
    await Post.isAuthor(user, _id);
    return await Post.update(_id, update);
  }

  @Router.delete("/posts/:_id")
  async deletePost(session: WebSessionDoc, _id: ObjectId) {
    const user = WebSession.getUser(session);
    await Post.isAuthor(user, _id);
    return Post.delete(_id);
  }

  @Router.get("/friends")
  async getFriends(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    return await User.idsToUsernames(await Friend.getFriends(user));
  }

  @Router.delete("/friends/:friend")
  async removeFriend(session: WebSessionDoc, friend: string) {
    const user = WebSession.getUser(session);
    const friendId = (await User.getUserByUsername(friend))._id;
    return await Friend.removeFriend(user, friendId);
  }

  @Router.get("/friend/requests")
  async getRequests(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    return await Responses.friendRequests(await Friend.getRequests(user));
  }

  @Router.post("/friend/requests/:to")
  async sendFriendRequest(session: WebSessionDoc, to: string) {
    const user = WebSession.getUser(session);
    const toId = (await User.getUserByUsername(to))._id;
    return await Friend.sendRequest(user, toId);
  }

  @Router.delete("/friend/requests/:to")
  async removeFriendRequest(session: WebSessionDoc, to: string) {
    const user = WebSession.getUser(session);
    const toId = (await User.getUserByUsername(to))._id;
    return await Friend.removeRequest(user, toId);
  }

  @Router.put("/friend/accept/:from")
  async acceptFriendRequest(session: WebSessionDoc, from: string) {
    const user = WebSession.getUser(session);
    const fromId = (await User.getUserByUsername(from))._id;
    return await Friend.acceptRequest(fromId, user);
  }

  @Router.put("/friend/reject/:from")
  async rejectFriendRequest(session: WebSessionDoc, from: string) {
    const user = WebSession.getUser(session);
    const fromId = (await User.getUserByUsername(from))._id;
    return await Friend.rejectRequest(fromId, user);
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
  async updateOrganizationName(session: WebSessionDoc, orgName: string) {
    // const user = WebSession.getUser(session);
    // const { msg, team } = await Team.create(orgName, user);
    // if (team) {
    //   await Membership.addMembership(user, team._id);
    // }
    // return { msg: msg, team: team };
  }

  @Router.patch("/organization/:id")
  async addMemberToOrganization(session: WebSessionDoc, orgName: string) {
    // const user = WebSession.getUser(session);
    // const { msg, team } = await Team.create(orgName, user);
    // if (team) {
    //   await Membership.addMembership(user, team._id);
    // }
    // return { msg: msg, team: team };
  }

  @Router.patch("/organization/:id")
  async updateMemberStatus(session: WebSessionDoc, orgName: string) {
    // const user = WebSession.getUser(session);
    // const { msg, team } = await Team.create(orgName, user);
    // if (team) {
    //   await Membership.addMembership(user, team._id);
    // }
    // return { msg: msg, team: team };
  }

  @Router.patch("/organization/:id")
  async removeUserFromOrganization(session: WebSessionDoc, orgName: string) {
    // const user = WebSession.getUser(session);
    // const { msg, team } = await Team.create(orgName, user);
    // if (team) {
    //   await Membership.addMembership(user, team._id);
    // }
    // return { msg: msg, team: team };
  }

  @Router.delete("/organization/:id")
  async deleteOrganization(session: WebSessionDoc, orgName: string) {
    // const user = WebSession.getUser(session);
    // const { msg, team } = await Team.create(orgName, user);
    // if (team) {
    //   await Membership.addMembership(user, team._id);
    // }
    // return { msg: msg, team: team };
  }

  // @Router.delete("/organization/:id")
  // async deleteUser(session: WebSessionDoc, orgName: string) {
  //   // const user = WebSession.getUser(session);
  //   // const { msg, team } = await Team.create(orgName, user);
  //   // if (team) {
  //   //   await Membership.addMembership(user, team._id);
  //   // }
  //   // return { msg: msg, team: team };
  // }
  // @Router.get()
  // @Router.patch()
  // @Router.post()
  // @Router.delete()

  // return inventory of given organization
  @Router.get("/inventory/:orgId")
  async getOrganizationInventory(session: WebSessionDoc, orgId: ObjectId, item?: string) {
    const user = WebSession.getUser(session);
    await Membership.isMember(user, orgId);
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
    await Membership.isMember(user, stock.owner);
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
    await Membership.isMember(user, owner);
    return await Stock.createStock(owner, item, count, diet, link, img, maxp);
  }

  @Router.delete("/inventory")
  async deleteInventoryItem(session: WebSessionDoc, id: ObjectId) {
    const user = WebSession.getUser(session);
    const stock = await Stock.getStockById(id);
    await Membership.isMember(user, stock.owner);
    return await Stock.deleteStock(id);
  }
}

export default getExpressRouter(new Routes());
