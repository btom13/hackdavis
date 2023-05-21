const { MongoClient, ServerApiVersion } = require("mongodb");
const jwt = require("jsonwebtoken");
let client = null;
const types = [
  "dress",
  "jacket",
  "long-sleeve/button up",
  "pants/jeans",
  "shirts",
  "shoes",
  "shorts",
  "skirt",
  "sweater/cardigan",
  "tank top",
  "bag/backpack",
  "belt",
  "hat",
  "ring/jewelry",
  "sunglasses",
  "tie",
  "books",
  "household",
  "misc",
  "school supplies",
];

module.exports = async function (context, req) {
  if (req.body === undefined) {
    context.res = {
      body: "no body",
    };
    return;
  }
  let type = req.body.type;
  if (type === undefined) {
    context.res = {
      body: "no type",
    };
    return;
  }
  let category = req.body.category;
  if (category === undefined) {
    context.res = {
      body: "no category",
    };
    return;
  }
  type = type.toString().toLowerCase();
  if (types.includes(type)) {
    context.res = {
      body: "invalid type",
    };
    return;
  }
  if (req.body.token === undefined) {
    context.res = {
      body: "no token",
    };
    return;
  }
  let user;
  try {
    user = jwt.verify(req.body.token, process.env["JWT_SECRET"]).username;
  } catch (err) {
    context.res = {
      body: "invalid token",
    };
    return;
  }
  if (client == null) {
    client = new MongoClient(process.env["MONGO_URI"], {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
    });
    client.connect();
    await query();
  } else {
    await query();
  }

  async function query() {
    let cat = await client
      .db("reuse")
      .collection("categories")
      .findOne({ name: category });
    if (cat === null) {
      context.res = {
        body: "Invalid category",
      };
      return;
    }
    let items = cat.items;
    if (!items.includes(type)) {
      context.res = {
        body: "Type does not exist",
      };
      return;
    }
    items.splice(items.indexOf(type), 1);
    let res = await client
      .db("reuse")
      .collection("categories")
      .updateOne({ name: category }, { $set: { items: items } });
    if (res === null) {
      context.res = {
        body: "Failed to add type to category",
      };
      return;
    }
    res = await client
      .db("reuse")
      .collection("items")
      .deleteMany({ type: type });
    if (res === null) {
      await client
        .db("reuse")
        .collection("categories")
        .updateOne({ name: category }, { $push: { items: type } });
      context.res = {
        body: "Failed to add type to category",
      };
      return;
    }
    await client.db("reuse").collection("history").insertOne({
      type: type,
      category: category,
      operation: "removeType",
      date: new Date(),
      user: user,
    });
    context.res = {
      body:
        "Successfully removed type " +
        type +
        " from category " +
        category +
        ".",
    };
  }
};
