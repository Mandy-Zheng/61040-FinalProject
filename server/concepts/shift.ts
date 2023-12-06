import { ObjectId } from "mongodb";

import DocCollection, { BaseDoc } from "../framework/doc";
import { BadValuesError, NotAllowedError, NotFoundError } from "./errors";

export interface ShiftDoc extends BaseDoc {
  owner: ObjectId;
  volunteers: Array<ObjectId>;
  start: Date;
  end: Date;
}

export default class ShiftConcept {
  public readonly shifts = new DocCollection<ShiftDoc>("shifts");

  async createShift(owner: ObjectId, start: Date, end: Date) {
    if (end <= start) {
      throw new BadValuesError("Invalid start/end times for shift");
    }
    await this.isFutureShift(end);
    const _id = await this.shifts.createOne({ owner: owner, volunteers: [], start: start, end: end });
    return { msg: "Shift successfully created!", shift: await this.shifts.readOne({ _id }) };
  }

  async getShiftsByOwner(owner: ObjectId) {
    const shifts = await this.shifts.readMany({ owner: owner }, { sort: { start: 1 } });
    console.log("not future", shifts);
    return shifts;
  }

  async getFutureShiftsByOwner(owner: ObjectId) {
    const today = new Date();
    const shifts = await this.shifts.readMany({ owner: owner, end: { $gt: today } }, { sort: { start: 1 } });
    console.log("future", shifts);
    return shifts;
  }

  async getShiftsByUser(user: ObjectId) {
    const shifts = await this.shifts.readMany({}, { sort: { start: 1 } });
    const claimedShifts = shifts.filter((s) => s.volunteers.map((v) => v.toString()).includes(user.toString()));
    return claimedShifts;
  }

  async getFutureShiftsByUser(user: ObjectId) {
    const today = new Date();
    const shifts = await this.shifts.readMany({ end: { $gt: today } }, { sort: { start: 1 } });
    const claimedShifts = shifts.filter((s) => s.volunteers.map((v) => v.toString()).includes(user.toString()));
    return claimedShifts;
  }

  async getShiftById(_id: ObjectId) {
    const shift = await this.shifts.readOne({ _id });
    if (!shift) {
      throw new NotFoundError("Shift not found");
    }
    return shift;
  }

  async claimShift(_id: ObjectId, user: ObjectId) {
    const shift = await this.shifts.readOne({ _id });
    if (!shift) {
      throw new NotFoundError(`Shift not found`);
    }
    await this.isFutureShift(shift.end);
    await this.notClaimed(shift, user);
    const newVolunteers = shift.volunteers;
    newVolunteers.push(user);
    await this.shifts.updateOne({ _id }, { volunteers: newVolunteers });
    return { msg: "Claimed shift successfully!" };
  }

  async unclaimShift(_id: ObjectId, user: ObjectId) {
    const shift = await this.shifts.readOne({ _id });
    if (!shift) {
      throw new NotFoundError(`Shift not found`);
    }
    await this.alreadyClaimed(shift, user);
    const newVolunteers = shift.volunteers.filter((u) => u.toString() !== user.toString());
    await this.shifts.updateOne({ _id }, { volunteers: newVolunteers });
    return { msg: "Unclaimed shift successfully!" };
  }

  async unclaimShiftsByUser(user: ObjectId) {
    const claimedShifts = await this.getShiftsByUser(user);
    claimedShifts.forEach((s) => this.unclaimShift(s._id, user));
    return { msg: "Unclaimed shifts successfully!" };
  }

  async deleteShift(_id: ObjectId) {
    await this.shifts.deleteOne({ _id });
    return { msg: "Succesfully deleted shift!" };
  }

  async deleteShiftsByOwner(orgId: ObjectId) {
    await this.shifts.deleteMany({ owner: orgId });
    return { msg: "Succesfully deleted shifts!" };
  }

  // throw error if user has already claimed shift
  private async notClaimed(shift: ShiftDoc, user: ObjectId) {
    for (const u of shift.volunteers) {
      if (u.toString() === user.toString()) {
        throw new NotAllowedError(`${user} has already claimed shift ${shift._id}`);
      }
    }
  }

  // throw error if user has not already claimed shift
  private async alreadyClaimed(shift: ShiftDoc, user: ObjectId) {
    if (shift.volunteers.every((u) => u.toString() !== user.toString())) {
      throw new NotAllowedError(`${user} has not claimed shift ${shift._id}`);
    }
  }

  // throw error if shift has already passed
  private async isFutureShift(end: Date) {
    const today = new Date();
    if (end <= today) {
      throw new NotAllowedError("Cannot create shifts in the past");
    }
  }
}
