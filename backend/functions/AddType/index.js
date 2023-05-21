const { MongoClient, ServerApiVersion } = require("mongodb");
const jwt = require("jsonwebtoken");
let client = null;

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
  type = type.toString();
  category = category.toString();
  type = type.toLowerCase();
  category = category.toLowerCase();
  if (type === "") {
    context.res = {
      body: "empty type",
    };
    return;
  }
  if (category === "") {
    context.res = {
      body: "empty category",
    };
    return;
  }
  if (type.length > 25) {
    context.res = {
      body: "type too long",
    };
    return;
  }
  if (
    category != "clothes" &&
    category != "accessories" &&
    category != "other"
  ) {
    context.res = {
      body: "invalid category",
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
    if (items.includes(type)) {
      context.res = {
        body: "Type already exists",
      };
      return;
    }
    items.push(type);
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
      .insertOne({ type: type, category: category, quantity: 0 });
    if (res === null) {
      await client
        .db("reuse")
        .collection("categories")
        .updateOne(
          { name: category },
          {
            $pull: {
              items: type,
            },
          }
        );
      context.res = {
        body: "Failed to add type to category",
      };
      return;
    }
    await client.db("reuse").collection("history").insertOne({
      type: type,
      category: category,
      operation: "addType",
      date: new Date(),
      user: user,
    });
    context.res = {
      body:
        "Successfully added type " + type + " to category " + category + ".",
    };
  }
};
