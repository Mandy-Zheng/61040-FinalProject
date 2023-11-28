import { ObjectId } from "mongodb";

import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError, NotFoundError } from "./errors";

export interface StockDoc extends BaseDoc {
  owner: ObjectId;
  item: string;
  count: number;
  supplyLink?: string;
  image?: string;
  maxPerDay: number;
  maxPerPerson: number;
}

export default class StockConcept {
  public readonly stocks = new DocCollection<StockDoc>("stocks");

  async createStock(owner: ObjectId, item: string, count: number, link?: string, img?: string, maxPP: number = 3) {
    await this.isItemUnique(owner, item); // can't duplicate item name within same owner
    const _id = await this.stocks.createOne({ owner, item, count, supplyLink: link, image: img, maxPerDay: 0, maxPerPerson: maxPP });
    if (count < 0) {
      throw new NotAllowedError("Initial stock count cannot be negative");
    }
    return { msg: "Stock successfully created!", stock: await this.stocks.readOne({ _id }) };
  }

  async getStocksByOwner(owner: ObjectId) {
    const stocks = await this.stocks.readMany({ owner });
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
    await this.stocks.updateOne({ _id }, { count: stock.count + change });
    return { msg: "Stock successfully updated!" };
  }

  async deleteStock(_id: ObjectId) {
    await this.stocks.deleteOne({ _id });
    return { msg: "Stock successfully deleted!" };
  }

  async isOwner(owner: ObjectId, _id: ObjectId) {
    const stock = await this.stocks.readOne({ _id });
    if (!stock) {
      throw new NotFoundError(`Stock ${_id} does not exist!`);
    }
    if (stock.owner.toString() !== owner.toString()) {
      throw new NotAllowedError(`${owner} is not the owner of stock ${_id}!`);
    }
  }

  private sanitizeUpdate(update: Partial<StockDoc>) {
    // update cannot change the stock owner or count
    const unallowedUpdates = ["owner", "count"];
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
