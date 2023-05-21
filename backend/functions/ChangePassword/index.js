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
    if (!req.body.newPassword) {
      context.res = {
        status: 200,
        body: "Missing password",
      };
      return;
    }
    if (!req.body.confirmPassword) {
      context.res = {
        status: 200,
        body: "Missing password",
      };
      return;
    }
    if (!req.body.oldPassword) {
      context.res = {
        status: 200,
        body: "Missing password",
      };
      return;
    }
    if (!req.body.token) {
      context.res = {
        status: 200,
        body: "Missing token",
      };
      return;
    }
    if (req.body.newPassword != req.body.confirmPassword) {
      context.res = {
        status: 200,
        body: "Passwords do not match",
      };
      return;
    }
    let user;
    try {
      user = jwt.verify(req.body.token, process.env["JWT_SECRET"]).username;
    } catch (err) {
      context.res = {
        status: 200,
        body: "Invalid token",
      };
      return;
    }

    let userObj = await client
      .db("reuse")
      .collection("users")
      .findOne({ username: user });
    let match = await bcrypt.compare(req.body.oldPassword, userObj.password);
    if (!match) {
      context.res = {
        status: 200,
        body: "Incorrect password",
      };
      return;
    }
    let hash = await bcrypt.hash(req.body.newPassword, 10);
    await client
      .db("reuse")
      .collection("users")
      .updateOne({ username: user }, { $set: { password: hash } });
    context.res = {
      status: 200,
      body: "Password changed",
    };
  }
};
