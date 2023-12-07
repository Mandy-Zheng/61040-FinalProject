import { ObjectId } from "mongodb";

import DocCollection, { BaseDoc } from "../framework/doc";
import { BadValuesError, NotAllowedError, NotFoundError } from "./errors";
import { DietaryRestrictions } from "./household";

export interface StockDoc extends BaseDoc {
  owner: ObjectId;
  item: string;
  count: number;
  diet: Array<DietaryRestrictions>;
  supplyLink?: string;
  image?: string;
  maxPerPerson: number;
  maxPerDay: number;
}

export default class StockConcept {
  public readonly stocks = new DocCollection<StockDoc>("stocks");

  async createStock(owner: ObjectId, item: string, count: number, diet: Array<DietaryRestrictions>, link?: string, img?: string, maxPP: number = 3) {
    await this.isItemUnique(owner, item); // can't duplicate item name within same owner
    const _id = await this.stocks.createOne({ owner, item, count, diet, supplyLink: link, image: img, maxPerPerson: maxPP, maxPerDay: 0 });
    if (count < 0) {
      throw new NotAllowedError("Initial stock count cannot be negative");
    }
    if (item.length === 0) {
      throw new BadValuesError("Item must have a name!");
    }
    return { msg: "Stock successfully created!", stock: await this.stocks.readOne({ _id }) };
  }

  async getStocksByOwner(owner: ObjectId) {
    const stocks = await this.stocks.readMany({ owner }, { sort: { item: 1 } });
    return stocks;
  }

  async getStockByItem(owner: ObjectId, item: string) {
    const stock = await this.stocks.readOne({ owner, item });
    if (!stock) {
      throw new NotFoundError("Stock not found");
    }
    return stock;
  }

  async getStockById(_id: ObjectId) {
    const stock = await this.stocks.readOne({ _id });
    if (!stock) {
      throw new NotFoundError("Stock not found");
    }
    return stock;
  }

  async updateStockDetails(_id: ObjectId, update: Partial<StockDoc>) {
    this.sanitizeUpdate(update);
    if (update.item !== undefined && !update.item) {
      throw new BadValuesError("Item must have a name!");
    }
    await this.stocks.updateOne({ _id }, update);
    return { msg: "Stock successfully updated!" };
  }

  async updateStockQuantity(_id: ObjectId, change: number) {
    const stock = await this.stocks.readOne({ _id });
    if (!stock) {
      throw new NotFoundError("Stock not found");
    }
    if (stock.count + change < 0) {
      throw new NotAllowedError("Stock count cannot be negative");
    }
    await this.stocks.updateOne({ _id }, { count: change });
    return { msg: "Stock successfully updated!" };
  }

  async decrementStockQuantity(_id: ObjectId, change: number) {
    const stock = await this.stocks.readOne({ _id });
    if (!stock) {
      throw new NotFoundError("Stock not found");
    }
    if (stock.count - change < 0) {
      throw new NotAllowedError("Stock count cannot be negative");
    }
    await this.stocks.updateOne({ _id }, { count: stock.count - change, maxPerDay: stock.maxPerDay - change });
    return { msg: "Stock successfully updated!" };
  }

  async deleteStock(_id: ObjectId) {
    await this.stocks.deleteOne({ _id });
    return { msg: "Stock successfully deleted!" };
  }

  async setTodaysAllocation(_id: ObjectId) {
    const stock = await this.stocks.readOne({ _id });
    if (!stock) return;
    const currentDate = new Date();
    const currentDay = currentDate.getDay(); // sunday is 0, monday is 1, etc.
    await this.stocks.updateOne({ _id }, { maxPerDay: Math.floor(stock.count / (7 - currentDay)) });
  }

  private sanitizeUpdate(update: Partial<StockDoc>) {
    // update cannot change the stock owner or count
    const unallowedUpdates = ["owner"];
    for (const key in update) {
      if (unallowedUpdates.includes(key)) {
        throw new NotAllowedError(`Cannot update '${key}' field!`);
      }
    }
  }

  private async isItemUnique(owner: ObjectId, item: string) {
    if (await this.stocks.readOne({ owner, item })) {
      throw new NotAllowedError(`Item with name ${item} already exists!`);
    }
  }
}
