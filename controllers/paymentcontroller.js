import User from "../model/userSchema.js";
import Payment from "../model/paymentSchema.js";
import AppError from "../utils/error.util.js";
import crypto from "crypto";
import { razorpay } from "../server.js";
const getRazorpayApiKey = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      message: "Razorpay API key",
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};
const buySubscription = async (req, res, next) => {
  try {
    const { id } = req.user;
    const user = await User.findById(id);
    if (!user) {
      return next(new AppError("UnAuthorized Please Login"));
    }
    if (user.role === "ADMIN") {
      return next(new AppError("Admin Cannot purchase A Subscription", 400));
    }
    const options = {
      amount: 49900,
      currency: "INR",
    };
    const subscription = await razorpay.orders.create(options);

    //const subscription = await razorpay.subscriptions.create({
    //  plan_id: process.env.RAZORPAY_PLAN_ID,
    //  customer_notify: 1,
    //  quantity: 5,
    //  total_count: 6,
    //  start_at: 1495995837,
    //  addons: [
    //    {
    //      item: {
    //        name: "Delivery charges",
    //        amount: 30000,
    //        currency: "INR",
    //      },
    //    },
    //  ],
    //  notes: {
    //    key1: "value3",
    //    key2: "value2",
    //  },
    //});
    user.subscription.id = subscription.id;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Subscribed Successfully",
      order_id: subscription.id,
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};
const verifySubscription = async (req, res, next) => {
  try {
    const { id } = req.user;
    const { razorpay_payment_id, razorpay_signature } = req.body;
    const user = await User.findById(id);
    if (!user) {
      return next(new AppError("UnAuthorized Please Login"));
    }
    //const subscriptionId = user.subscription.id;
    //const generatedSignature = crypto
    //  .createHmac("sha256", process.env.RAZORPAY_SECRET)
    //  .update(`${razorpay_payment_id}|${subscriptionId}`)
    //  .digest("hex");

    //if (generatedSignature !== razorpay_signature) {
    //  return next(new AppError("Payment Not Verified , Please Try Again", 500));
    //}
    await Payment.create({
      razorpay_payment_id,
      razorpay_signature,
    });
    user.subscription.status = "active";
    await user.save();

    console.log("From paymeent", user);
    res.status(200).json({
      success: true,
      message: "Payment Verified Successfully",
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};
const cancelSubscription = async (req, res, next) => {
  try {
    const { id } = req.user;
    const user = await User.findById(id);
    if (!user) {
      return next(new AppError("UnAuthorized Please Login"));
    }
    if (user.role === "ADMIN") {
      return next(new AppError("Admin Cannot CANCEL A Subscription", 400));
    }
    //const subscriptionId = user.subscription.id;
    //const subscription = await razorpay.subscriptions.cancel(subscriptionId);
    //user.subscription.status = subscription.status;
    user.subscription.status = " ";
    await user.save();

    res.status(200).json({
      success: true,
      message: "Cancellation Successfully",
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};
const allPayments = async (req, res, next) => {
  try {
    const { count } = req.query;
    const subscriptions = await razorpay.orders.all({
      count: count || 10,
    });

    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const finalMonths = {
      January: 0,
      February: 0,
      March: 0,
      April: 0,
      May: 0,
      June: 0,
      July: 0,
      August: 0,
      September: 0,
      October: 0,
      November: 0,
      December: 0,
    };

    const monthlyWisePayments = subscriptions.items.map((payment) => {
      // We are using payment.start_at which is in unix time, so we are converting it to Human readable format using Date()
      if (payment.status == "paid") {
        const monthsInNumbers = new Date(payment.created_at * 1000);

        return monthNames[monthsInNumbers.getMonth()];
      }
    });

    monthlyWisePayments.map((month) => {
      Object.keys(finalMonths).forEach((objMonth) => {
        if (month === objMonth) {
          finalMonths[month] += 1;
        }
      });
    });

    const monthlySalesRecord = [];

    Object.keys(finalMonths).forEach((monthName) => {
      monthlySalesRecord.push(finalMonths[monthName]);
    });

    res.status(200).json({
      success: true,
      message: "All Payments",
      subscriptions,
      finalMonths,
      monthlySalesRecord,
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};
export {
  getRazorpayApiKey,
  buySubscription,
  verifySubscription,
  cancelSubscription,
  allPayments,
};
