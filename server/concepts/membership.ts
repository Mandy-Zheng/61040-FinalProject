import { ObjectId } from "mongodb";

import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError, NotFoundError } from "./errors";

export interface MembershipDoc extends BaseDoc {
  user: ObjectId;
  organizations: Array<string>;
}

export default class MembershipConcept {
  public readonly memberships = new DocCollection<MembershipDoc>("memberships");

  async create(user: ObjectId) {
    const organizations: Array<string> = [];
    const _id = await this.memberships.createOne({ user, organizations });
    return { msg: "Membership successfully created!", membership: await this.memberships.readOne({ _id }) };
  }

  async get(user: ObjectId) {
    const membership = await this.memberships.readOne({ user });
    if (!membership) {
      throw new NotFoundError("User's Membership Not Found");
    }
    return membership;
  }

  async addMembership(user: ObjectId, orgId: ObjectId) {
    const oldOrganizations = await this.get(user);
    const organization = orgId.toString();
    const organizations = oldOrganizations.organizations.filter((org) => org === organization);
    organizations.push(organization);
    await this.memberships.updateOne({ user }, { organizations });
    return { msg: "Successfully Added Membership!" };
  }

  async removeMembership(user: ObjectId, orgId: ObjectId) {
    const oldOrganizations = await this.get(user);
    const organization = orgId.toString();
    const organizations = oldOrganizations.organizations.filter((org) => org === organization);
    await this.memberships.updateOne({ user }, { organizations });
    return { msg: "Successfully Removed Membership!" };
  }

  async deleteUserMembership(user: ObjectId) {
    await this.memberships.deleteOne({ user });
    return { msg: "Memberships of User are Successfully Deleted!" };
  }

  async isMember(member: ObjectId, org: ObjectId) {
    const membership = await this.get(member);
    if (!membership.organizations.includes(org.toString())) {
      throw new NotAllowedError(`${member} is not a member of organization ${org}!`);
    }
  }
}
