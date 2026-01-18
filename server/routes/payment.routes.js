import { Router } from "express";
import {
  getRazorpayApiKey,
  buySubscription,
  verifySubscription,
  cancelSubscription,
  allPayments,
} from "../controllers/paymentcontroller.js";
import isLoggedIn from "../middleware/auth.middleware.js";
import authorizedRoles from "../middleware/Author.middleware.js";

const paymentRouter = Router();
paymentRouter.route("/razorpay-key").get(isLoggedIn, getRazorpayApiKey);
paymentRouter.route("/subscribe").post(isLoggedIn, buySubscription);
paymentRouter.route("/verify").post(isLoggedIn, verifySubscription);
paymentRouter.route("/unsubscribe").post(isLoggedIn, cancelSubscription);
paymentRouter.route("/").get(isLoggedIn, authorizedRoles("ADMIN"), allPayments);
export default paymentRouter;
