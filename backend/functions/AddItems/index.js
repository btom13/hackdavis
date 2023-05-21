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
  const data = req.body.data;
  if (data === undefined) {
    context.res = {
      body: "no data",
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

  async function addAll(items) {
    const categories = await client
      .db("reuse")
      .collection("categories")
      .find({})
      .toArray();

    let invalid = false;

    items.forEach((item) => {
      if (item.quantity < 0) {
        invalid = true;
      }
      let num = 0;
      categories.forEach((category) => {
        if (!category.items.includes(item.type)) {
          num++;
        }
      });
      if (num === categories.length) {
        invalid = true;
      }
    });
    if (invalid) {
      return "Invalid item type";
    }

    const promises = items.map(async (item) => {
      if (item.quantity === undefined) {
        item.quantity = 1;
      }
      const result = await client
        .db("reuse")
        .collection("items")
        .updateOne({ type: item.type }, { $inc: { quantity: item.quantity } });
      return result;
    });
    await Promise.all(promises);
    await client
      .db("reuse")
      .collection("history")
      .insertMany(
        items.map((item) => {
          return {
            type: item.type,
            quantity: item.quantity,
            date: new Date(),
            operation: "addItem",
            user: user,
          };
        })
      );
    let result = "";
    items.forEach((item) => {
      result += `Added ${item.quantity} ${item.type}\n`;
    });
    return result.trim();
  }

  async function query() {
    context.res = {
      body: await addAll(data),
    };
  }
};
