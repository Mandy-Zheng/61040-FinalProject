import { ObjectId } from "mongodb";

import DocCollection, { BaseDoc } from "../framework/doc";
import { BadValuesError, NotFoundError } from "./errors";
export enum DietaryRestrictions{
  None=0,
  Meat=1,
  AnimalBased=2,
  Gluten=3,
  Nut=4,
  Wheat=5,
  Fish=6,
  Eggs=7,
  Soy=8,
  Dairy=9,
  Kosher=10,
}
export enum Languages{
  English=0,
  Korean=1,
  Mandarin=2,
  Cantonese=3,
  //TODO: Add more languages
}
export interface HouseholdDoc extends BaseDoc {
  organization: ObjectId;
  members: Array<ObjectId>;
  dietaryRestrictions: Array<DietaryRestrictions>;
  preferredLanguage: Languages;
  pastVisits: Array<Date>;
  specialRequests: string;
}

export default class HouseholdConcept {
  public readonly households = new DocCollection<HouseholdDoc>("households");

  async create(org: ObjectId,members: Array<ObjectId>,diet: Array<string>, language: string, requests: Array<ObjectId>) {
    const _id = await this.households.createOne({organization:org,members:members,dietaryRestrictions:diet,preferredLanguage:language,specialRequests:requests});
    return { msg: "HouseholdProfile successfully created!", household: await this.households.readOne({ _id }) };
  }

  async getProfilesByOwner(org: ObjectId) {
    const households = await this.households.readMany({ organization:org });
    if (!households) {
      throw new NotFoundError("Household Profiles not found for organization");
    }
    return households;
  }

  async getProfileById(_id: ObjectId) {
    const household = await this.households.readOne({_id});
    if (!household) {
      throw new NotFoundError("Household Profile not found for specified id");
    }
    return household;
  }

  async updateMembers(_id: ObjectId,members: Array<ObjectId>) {
    const household = await this.getProfileById(_id);
    household.members=members;
  }

  async addMember(_id: ObjectId,member: ObjectId) {
    const household = await this.getProfileById(_id);
    household.members.forEach((id,_)=>{
      if(id.equals(member))
        throw new BadValuesError("Member of household already exists!");
    });
    household.members.push(member);
  }

  async removeMember(_id: ObjectId,member: ObjectId) {
    const household = await this.getProfileById(_id);
    const idxList = new Array<number>;
    household.members.forEach((id,idx)=>{
      if(id.equals(member)) idxList.push(idx);
    });
    for(let i=idxList.length-1;i>=0;i--)
      household.members.splice(idxList[i],1);
  }

  async addVisit(_id: ObjectId)
  {
    const household = await this.getProfileById(_id);
    household.pastVisits.push(new Date());
  }

  async resetVisits(_id: ObjectId)
  {
    const household = await this.getProfileById(_id);
    household.pastVisits=new Array<Date>;
  }

  async countVisits(_id: ObjectId)
  {
    const household = await this.getProfileById(_id);
    return household.members.length;
  }

  async updateLanguage(_id: ObjectId,lang:Languages)
  {
    const household = await this.getProfileById(_id);
    household.preferredLanguage=lang;
  }

  async updateRequests(_id: ObjectId,req:string)
  {
    const household = await this.getProfileById(_id);
    household.specialRequests=req;
  }

  async addDietaryRestriction(_id: ObjectId,diet:DietaryRestrictions)
  {
    const household = await this.getProfileById(_id);
    household.dietaryRestrictions.forEach((id,idx)=>{
      if(id.valueOf()===diet.valueOf())
        throw new BadValuesError("Dietary Restriction of household already exists!");
    });
  }

  async removeDietaryRestriction(_id: ObjectId,diet:DietaryRestrictions)
  {
    const household = await this.getProfileById(_id);
    const idxList = new Array<number>;
    household.dietaryRestrictions.forEach((id,idx)=>{
      if(id.valueOf()===diet.valueOf()) idxList.push(idx);
    });
    for(let i=idxList.length-1;i>=0;i--)
      household.dietaryRestrictions.splice(idxList[i],1);
  }

  async updateDietaryRestrictions(_id: ObjectId,diets:Array<DietaryRestrictions>)
  {
    const household = await this.getProfileById(_id);
    household.dietaryRestrictions=diets;
  }

  async delete(_id: ObjectId) {
    await this.households.deleteOne({_id});
    return { msg: "Succesfully deleted household profile" };
  }
}
