require("dotenv").config();

const mongoose = require("mongoose");
// mongodb+srv://hartongit102:123@initialcluster.yhdfy.mongodb.net/?retryWrites=true&w=majority&appName=initialCluster
const mongoURI = `mongodb+srv://${process.env.DATABASE_USERNAME}:${process.env.DATABASE_PASSWORD}@initialCluster.yhdfy.mongodb.net/devRecruit?retryWrites=true&`


const DbConnection = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log("Connected to Mongodb database");
  } catch (error) {
    console.log("Failed to connect to Mongodb:", error.message);
  }
};
module.exports = DbConnection;