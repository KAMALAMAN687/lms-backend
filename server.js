import app from "./app.js";
import Razorpay from "razorpay";
import cloudinary from "cloudinary";

//Cloudinary configuration

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
// Razorpay configuration
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, (req, res) => {
  console.log(`server is running on http://localhost:${PORT}`);
});
export default razorpay;
