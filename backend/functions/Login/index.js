const { MongoClient, ServerApiVersion } = require("mongodb");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

let client = null;
module.exports = async function (context, req) {
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
    if (!req.body.username) {
      context.res = {
        status: 200,
        body: { response: "Missing username" },
      };
      return;
    }
    if (!req.body.password) {
      context.res = {
        status: 200,
        body: { response: "Missing password" },
      };
      return;
    }
    let user = await client
      .db("reuse")
      .collection("users")
      .findOne({ username: req.body.username });
    if (user == null) {
      context.res = {
        status: 200,
        body: { response: "Username or password is incorrect" },
      };
      return;
    }
    let match = await bcrypt.compare(req.body.password, user.password);
    if (!match) {
      context.res = {
        status: 200,
        body: { response: "Username or password is incorrect" },
      };
      return;
    }
    let token = jwt.sign(
      { username: req.body.username },
      process.env["JWT_SECRET"]
    );
    context.res = {
      status: 200,
      body: {
        response: "Login successful",
        token: token,
      },
    };
  }
};
