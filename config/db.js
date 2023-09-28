import mongoose from "mongoose";

mongoose.set("strictQuery", false);

const connectToDb = async () => {
  try {
    await mongoose.connect(
      process.env.MONGO_URI || `mongodb://localhost:27017/lmsproject`
    );
    console.log("your DB is Connected Successfully ");
  } catch (error) {
    console.log(`Error : ${error}`);
    process.exit(1);
  }
};

export default connectToDb;
