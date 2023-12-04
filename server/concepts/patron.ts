import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotFoundError } from "./errors";

export interface PatronDoc extends BaseDoc {
  name: string;
  birthday: string;
  image: string;
}

export default class PatronConcept {
  public readonly patrons = new DocCollection<PatronDoc>("patrons");

  async create(name: string, birthday: string, image: string) {
    const _id = await this.patrons.createOne({ name, birthday, image });
    const patron = await this.patrons.readOne({ _id });
    if (patron == null) {
      throw new NotFoundError(`Patron not found!`);
    }
    return { msg: "Patron successfully created!", patron: patron };
  }

  async getPatronById(_id: ObjectId) {
    const patron = await this.patrons.readOne({ _id });
    if (patron == null) {
      throw new NotFoundError(`Patron not found!`);
    }
    return patron;
  }

  async updatePatron(_id: ObjectId, update: Partial<PatronDoc>) {
    await this.patrons.updateOne({ _id }, update);
    return { msg: "Patron updated successfully!" };
  }

  async deletePatron(_id: ObjectId) {
    await this.patrons.deleteOne({ _id });
    return { msg: "Patron deleted!" };
  }
}
