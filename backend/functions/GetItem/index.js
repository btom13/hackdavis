const { MongoClient, ServerApiVersion } = require("mongodb");
const jwt = require("jsonwebtoken");
let client = null;

module.exports = async function (context, req) {
  if (req.body.token === undefined) {
    context.res = {
      body: "no token",
    };
    return;
  }
  try {
    jwt.verify(req.body.token, process.env["JWT_SECRET"]);
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
    const type = req.query.type || (req.body && req.body.type);
    let quantity = await client
      .db("reuse")
      .collection("items")
      .findOne({ type: type });
    if (quantity === null) {
      context.res = {
        body: "Invalid item type",
      };
      return;
    }
    context.res = {
      body: quantity.quantity,
    };
  }
};
