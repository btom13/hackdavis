const { MongoClient, ServerApiVersion } = require("mongodb");
const { uri } = require("./config.json");
let { Clothes, Accessories, Other } = require("./categories.json");

class Db {
  static async initializeDb() {
    const client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
    });
    await client.connect();
    const database = new Db();
    database.client = client;
    database.db = client.db("reuse");
    database.collection = database.db.collection("items");
    return database;
  }
  static get clothes() {
    return Clothes;
  }
  static get accessories() {
    return Accessories;
  }
  static get other() {
    return Other;
  }

  async insert(item) {
    const result = await this.collection.insertOne(item);
    return result;
  }

  async add(item, quantity = 1) {
    const result = await this.collection.updateOne(
      { type: item.type },
      { $inc: { quantity: quantity } }
    );
    return result;
  }

  async addAll(items) {
    const promises = items.map(async (item) => {
      if (item.quantity === undefined) {
        item.quantity = 1;
      }
      const result = await this.collection.updateOne(
        { type: item.type },
        { $inc: { quantity: item.quantity } }
      );
      return result;
    });
    return Promise.all(promises);
  }

  async remove(item, quantity = 1) {
    // check if current quantity is greater than quantity
    // if not, set quantity to 0
    const current_quantity = await this.collection.findOne({
      type: item.type,
    });
    if (current_quantity.quantity < quantity) {
      return "Quantity cannot be less than 0";
    }
    return this.add(item, -quantity);
  }
  async insertAll(items) {
    const result = await this.collection.insertMany(items);
    return result;
  }
}
let database;

async function add_clothes(database) {
  let clothes = Db.clothes;
  const promises = clothes.map((type) => {
    return {
      type: type,
      category: "clothes",
      quantity: 0,
    };
  });
  return database.insertAll(promises);
}

async function add_accessories(database) {
  let accessories = Db.accessories;
  const promises = accessories.map((type) => {
    return {
      type: type,
      category: "accessories",
      quantity: 0,
    };
  });
  return database.insertAll(promises);
}

async function add_other(database) {
  let other = Db.other;
  const promises = other.map((type) => {
    return {
      type: type,
      category: "other",
      quantity: 0,
    };
  });
  return database.insertAll(promises);
}

async function add_categories(database) {
  await database.db.collection("categories").deleteMany({});
  await database.db.collection("categories").insertMany([
    { name: "clothes", items: Db.clothes },
    { name: "accessories", items: Db.accessories },
    { name: "other", items: Db.other },
  ]);
}

async function run() {
  try {
    database = await Db.initializeDb();
    let res;
    res = await fetch(
      "https://aggie-reuse.azurewebsites.net/api/AddItems?code=Ms1gGUN9IEGdsysS0KuXM9xu7v5FD27YSLO0HNjOJthwAzFudx5FIQ==&clientId=default",
      {
        method: "POST",
        body: '{"data": [{"type": "shirts", "quantity": 5}]}',
      }
    );
    console.log(await res.text());
    res = await fetch(
      "https://aggie-reuse.azurewebsites.net/api/GetAllItems?code=-Fjj8lcCpsLQQFZSMehNNTAh_yOFTzo9OSfOmz__Bhj_AzFuizWnPg=="
    );
    // console.log(await res.json());
    res = await fetch(
      "https://aggie-reuse.azurewebsites.net/api/GetItem?code=tKMtn4I70JYJqtjQFc3r88hVk76_TG22_-sJtl8C0rcHAzFuDBo4dw==&type=shirts"
    );
    console.log(await res.text());
    res = await fetch(
      "https://aggie-reuse.azurewebsites.net/api/RemoveItems?code=XrwbrEgE4nFtb2NOhvBGieQ4yLM0jSqzwOpsYZn6CntoAzFuAF3vSg==",
      {
        method: "POST",
        body: '{"data": [{"type": "shirts", "quantity": 2}]}',
      }
    );
    console.log(await res.text());
    res = await fetch(
      "https://aggie-reuse.azurewebsites.net/api/AddType?code=PZygoORxBGcJRiPMffqKnYOsQo4PrUP9x1nJFdza8RnsAzFu5MQWPw==",
      {
        method: "POST",
        body: '{"category": "clothes", "type": "boots"}',
      }
    );
    console.log(await res.text());
    res = await fetch(
      "https://aggie-reuse.azurewebsites.net/api/GetCategories?code=ndxaiFhA5WDFWWCzN6oJKf1Z_O_lECDFY-TzzwMmqpUfAzFuZ5E7aw=="
    );
    console.log(await res.json());
    res = await fetch(
      "https://aggie-reuse.azurewebsites.net/api/RemoveType?code=GunNeGNCwCIqbA9Ptu0uy6DnfAIspCBPA1S8KJ-b3bRtAzFugLuS-Q==",
      {
        method: "POST",
        body: '{"category": "clothes", "type": "boots"}',
      }
    );
    console.log(await res.text());

    // await add_categories(database);
    // await database.db.collection("history").deleteMany({});
    // await database.collection.deleteMany({});
    // await add_clothes(database);
    // await add_accessories(database);
    // await add_other(database);
  } finally {
    await database.client.close();
  }
}

run();
