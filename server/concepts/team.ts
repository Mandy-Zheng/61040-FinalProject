import { ObjectId } from "mongodb";

import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError, NotFoundError } from "./errors";

export interface TeamDoc extends BaseDoc {
  name: string;
  admins: Array<ObjectId>;
  members: Array<ObjectId>;
}

export default class TeamConcept {
  public readonly teams = new DocCollection<TeamDoc>("teams");

  async create(name: string, founder: ObjectId) {
    const admins: Array<ObjectId> = [founder];
    const members: Array<ObjectId> = [];
    const _id = await this.teams.createOne({ name, admins, members });
    return { msg: "Team successfully created!", team: await this.teams.readOne({ _id }) };
  }

  async get(_id: ObjectId) {
    const team = await this.teams.readOne({ _id });
    if (!team) {
      throw new NotFoundError("Team Not Found");
    }
    return team;
  }

  private async isAdmin(_id: ObjectId, editor: ObjectId) {
    const team = await this.get(_id);
    if (!team) {
      throw new NotFoundError("Team Not Found");
    }
    if (team.admins.some((member) => member.equals(editor))) {
      throw new NotAllowedError("Non Admins Cannot Edit Team");
    }
    return team;
  }

  async isTeamMember(_id: ObjectId, user: ObjectId) {
    const team = await this.get(_id);
    if (!team) {
      throw new NotFoundError("Team Not Found");
    }
    if (team.admins.some((member) => member.equals(user)) || team.members.some((member) => member.equals(user))) {
      throw new NotAllowedError(`${user} is not a member of organization ${_id}!`);
    }
  }

  async updateName(_id: ObjectId, name: string, editor: ObjectId) {
    await this.isAdmin(_id, editor);
    await this.teams.updateOne({ _id }, { name });
    return { msg: "Successfully Updated Team Name" };
  }

  async removeUserFromTeam(_id: ObjectId, member: ObjectId, editor: ObjectId) {
    let oldTeam;
    if (member.equals(editor)) {
      oldTeam = await this.get(_id);
    } else {
      oldTeam = await this.isAdmin(_id, editor);
    }
    const members = oldTeam.members.filter((user) => user.equals(member));
    const admins = oldTeam.members.filter((user) => user.equals(member));
    await this.teams.updateOne({ _id }, { members, admins });
    return { msg: "Successfully Removed User From Team" };
  }

  async addUserAsMember(_id: ObjectId, member: ObjectId, editor: ObjectId) {
    const oldTeam = await this.isAdmin(_id, editor);
    const members = oldTeam.members.filter((user) => user.equals(member));
    const admins = oldTeam.members.filter((user) => user.equals(member));
    members.push(member);
    await this.teams.updateOne({ _id }, { members, admins });
    return { msg: "Successfully Added New Member to Team!" };
  }

  async addUserAsAdmin(_id: ObjectId, member: ObjectId, editor: ObjectId) {
    const oldTeam = await this.isAdmin(_id, editor);
    const members = oldTeam.members.filter((user) => user.equals(member));
    const admins = oldTeam.members.filter((user) => user.equals(member));
    admins.push(member);
    await this.teams.updateOne({ _id }, { members, admins });
    return { msg: "Successfully Added New Admin to Team!" };
  }

  async delete(_id: ObjectId, editor: ObjectId) {
    await this.isAdmin(_id, editor);
    await this.teams.deleteOne({ _id });
    return { msg: "Team is Successfully Deleted!" };
  }

  async idsToNames(ids: ObjectId[]) {
    const teams = await this.teams.readMany({ _id: { $in: ids } });

    // Store strings in Map because ObjectId comparison by reference is wrong
    const idToTeam = new Map(teams.map((t) => [t._id.toString(), t]));
    return ids.map((id) => idToTeam.get(id.toString())?.name ?? "DELETED_USER");
  }
}
