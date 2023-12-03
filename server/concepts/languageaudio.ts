import { ObjectId } from "mongodb";

import DocCollection, { BaseDoc } from "../framework/doc";
import { BadValuesError, NotAllowedError, NotFoundError } from "./errors";
import { Language } from "./household";

export interface LanguageAudioDoc extends BaseDoc {
  owner: ObjectId;
  language: Language;
  audio: string;
  translation: string;
}

export default class LanguageAudioConcept {
  public readonly languageAudio = new DocCollection<LanguageAudioDoc>("languageAudio");

  async create(owner: ObjectId, language: Language, audio: string, translation: string) {
    if (!language || !audio || !translation) {
      throw new BadValuesError("Missing Parts of Language Audio");
    }
    const _id = await this.languageAudio.createOne({ owner, language, audio, translation });
    return { msg: "Language Audio successfully created!", languageAudio: await this.languageAudio.readOne({ _id }) };
  }

  private sanitize(update: Partial<LanguageAudioDoc>) {
    // eslint-disable-next-line
    const { owner, ...rest } = update;
    return rest;
  }

  async getById(_id: ObjectId) {
    const languageAudio = await this.languageAudio.readOne({ _id });
    if (!languageAudio) {
      throw new NotFoundError("Language Audio Not Found");
    }
    return languageAudio;
  }

  async getByOwner(owner: ObjectId) {
    const languageAudio = await this.languageAudio.readOne({ owner });
    if (!languageAudio) {
      throw new NotFoundError("Language Audio Not Found");
    }
    return languageAudio;
  }

  async updateAudio(_id: ObjectId, editor: ObjectId, update: Partial<LanguageAudioDoc>) {
    this.sanitize(update);
    const languageAudio = await this.getById(_id);
    if (languageAudio.toString() !== editor.toString()) {
      throw new NotAllowedError("Only the owner can edit the Language Audio");
    }
    await this.languageAudio.updateOne({ _id }, update);
    return { msg: "Successfully Updated Language Audio Name" };
  }

  async deleteAudio(_id: ObjectId) {
    await this.languageAudio.deleteOne({ _id });
    return { msg: "Language Audio is Successfully Deleted!" };
  }
}
