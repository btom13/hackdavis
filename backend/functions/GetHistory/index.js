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
    let items = await client
      .db("reuse")
      .collection("history")
      .find({})
      .sort({ date: -1 })
      .toArray();
    items.forEach((item) => {
      delete item._id;
    });
    context.res = {
      body: items,
    };
  }
};
