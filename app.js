import { config } from "dotenv";
config();

import cors from "cors";
import morgan from "morgan";
import errorMiddleware from "./middleware/error.middleware.js";

import connectToDb from "./config/db.js";

//make express app
import express from "express";
import cookieParser from "cookie-parser";
const app = express();

await connectToDb();

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
import userRouter from "./routes/userRoutes.js";
import courseRouter from "./routes/courseRoutes.js";
import router from "./routes/miscellaneous.routes.js";
import paymentRouter from "./routes/payment.routes.js";
app.use("/api/v1/user", userRouter);
app.use("/api/v1/courses", courseRouter);
app.use("/api/v1", router);
app.use("/api/v1/payments", paymentRouter);

app.use("/ping", (req, res) => {
  res.send("/pong");
});
app.all("*", (req, res) => {
  res.status(404).send("OOPS!! 404  page not found ,Try Again");
});
app.use(errorMiddleware);

export default app;
