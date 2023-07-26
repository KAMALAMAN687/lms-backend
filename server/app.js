require("dotenv").config();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const morgan = require("morgan");
const errorMiddleware = require("./middleware/error.middleware");

const connectToDb = require("./config/db.js");

//make express app
const express = require("express");
const app = express();

connectToDb();

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: [process.env.FRONTEND_URL],
    credentials: true,
  })
  //ye jo frotened dusre server pr host hai usko use kr payeen
);

app.use(morgan("dev"));
const userRouter = require("./routes/userRoutes.js");
app.use("/api/v1/user", userRouter);

app.use("/ping", (req, res) => {
  res.send("/pong");
});
app.all("*", (req, res) => {
  res.status(404).send("OOPS!! 404 page not found");
});
app.use(errorMiddleware);

module.exports = app;
