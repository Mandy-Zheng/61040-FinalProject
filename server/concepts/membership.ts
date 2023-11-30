import { ObjectId } from "mongodb";

import DocCollection, { BaseDoc } from "../framework/doc";
import { NotFoundError } from "./errors";

export interface MembershipDoc extends BaseDoc {
  user: ObjectId;
  organizations: Array<ObjectId>;
}

export default class MembershipConcept {
  public readonly memberships = new DocCollection<MembershipDoc>("memberships");

  async create(user: ObjectId) {
    const organizations: Array<ObjectId> = [];
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

  async addMembership(user: ObjectId, organization: ObjectId) {
    const oldOrganizations = await this.get(user);
    const organizations = oldOrganizations.organizations.filter((org) => !org.equals(organization));
    organizations.push(organization);
    await this.memberships.updateOne({ user }, { organizations });
    return { msg: "Successfully Added Membership!" };
  }

  async hasMembership(user: ObjectId, organization: ObjectId) {
    const membership = await this.get(user);
    return membership.organizations.some((org) => org.equals(organization));
  }

  async removeMembership(user: ObjectId, orgId: ObjectId) {
    const pUser = await this.get(user);
    const organizations = pUser.organizations.filter((org) => !org.equals(orgId));
    await this.memberships.updateOne({ user }, { organizations });
    return { msg: "Successfully Removed Membership!" };
  }

  async deleteUserMembership(user: ObjectId) {
    await this.memberships.deleteOne({ user });
    return { msg: "Memberships of User are Successfully Deleted!" };
  }
}
