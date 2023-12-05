const express = require("express");
const app = express();
const bodyParser = require("body-parser");

// connect with database.
const dbConnect = require("./src/Config/db");
dbConnect();

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const {
  User,
} = require("./src/Routes/index");

app.use("/user", User.route);

require("dotenv").config();

const port = process.env.PORT || 7000;
app.listen(port, (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log(`Server started at ${port}`);
  }
});
