const { MongoClient, ServerApiVersion } = require("mongodb");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const saltRounds = 10;

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
    if (!req.body.masterPassword) {
      context.res = {
        status: 200,
        body: { response: "Missing master password" },
      };
      return;
    }
    let user = await client

      .db("reuse")
      .collection("users")
      .findOne({ username: req.body.username });
    if (user != null) {
      context.res = {
        status: 200,
        body: { response: "Username already exists" },
      };
      return;
    }

    let masterPassword = await client
      .db("reuse")
      .collection("users")
      .findOne({ type: "masterPassword" });
    let result = await bcrypt.compare(
      req.body.masterPassword,
      masterPassword.password
    );
    if (!result) {
      context.res = {
        status: 200,
        body: { response: "Master password is incorrect" },
      };
      return;
    }
    let hash = await bcrypt.hash(req.body.password, saltRounds);
    await client.db("reuse").collection("users").insertOne({
      username: req.body.username,
      password: hash,
    });
    let token = jwt.sign(
      { username: req.body.username },
      process.env["JWT_SECRET"]
    );
    context.res = {
      status: 200,
      body: { response: "Account created", token: token },
    };
  }
};
