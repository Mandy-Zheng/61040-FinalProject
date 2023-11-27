import { ObjectId } from "mongodb";

import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError, NotFoundError } from "./errors";

export interface TeamDoc extends BaseDoc {
  name: string;
  admins: Array<string>;
  members: Array<string>;
}

export default class TeamConcept {
  public readonly teams = new DocCollection<TeamDoc>("teams");

  async create(name: string, founder: ObjectId) {
    const admins: Array<string> = [founder.toString()];
    const members: Array<string> = [];
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
    if (team.admins.includes(editor.toString())) {
      throw new NotAllowedError("Non Admins Cannot Edit Team");
    }
    return team;
  }

  async updateName(_id: ObjectId, name: string) {
    await this.teams.updateOne({ _id }, { name });
    return { msg: "Successfully Updated Team Name" };
  }

  async removeUserFromTeam(_id: ObjectId, userId: ObjectId, editor: ObjectId) {
    const user = userId.toString();
    const oldTeam = await this.isAdmin(_id, editor);
    const members = oldTeam.members.filter((member) => user === member);
    const admins = oldTeam.members.filter((member) => user === member);
    await this.teams.updateOne({ _id }, { members, admins });
    return { msg: "Successfully Removed User From Team" };
  }

  async addUserAsMember(_id: ObjectId, userId: ObjectId, editor: ObjectId) {
    const user = userId.toString();
    const oldTeam = await this.isAdmin(_id, editor);
    const members = oldTeam.members.filter((member) => user === member);
    const admins = oldTeam.members.filter((member) => user === member);
    members.push(user.toString());
    await this.teams.updateOne({ _id }, { members, admins });
    return { msg: "Successfully Added New Member to Team!" };
  }

  async addUserAsAdmin(_id: ObjectId, userId: ObjectId, editor: ObjectId) {
    const user = userId.toString();
    const oldTeam = await this.isAdmin(_id, editor);
    const members = oldTeam.members.filter((member) => user === member);
    const admins = oldTeam.members.filter((member) => user === member);
    admins.push(user.toString());
    await this.teams.updateOne({ _id }, { members, admins });
    return { msg: "Successfully Added New Admin to Team!" };
  }

  async delete(_id: ObjectId) {
    await this.teams.deleteOne({ _id });
    return { msg: "Team is Successfully Deleted!" };
  }
}
