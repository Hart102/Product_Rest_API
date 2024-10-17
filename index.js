require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors")
const DbConnection = require("./config/mongoos")

// Routes
const userRouter = require("./routes/user")

const PORT = process.env.PORT || 3000;
const app = express();

app.use(cors({origin: "*"}))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

DbConnection()

app.get("/", (req, res) => {
  res.json("Welcome to FreshCart Api v1.")
})

app.use("/api/user", userRouter)


app.listen(PORT, () => {
  console.log(`App is running on ${PORT}`);
});
