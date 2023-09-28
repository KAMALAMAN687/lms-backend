import { model, Schema } from "mongoose";
const contactSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is Required"],
      minLength: [4, "Name should be greater than 4 character"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is Required"],
      trim: true,
      lowercase: true,
    },
    message: {
      type: String,
      required: [true, "Message is Required"],
    },
  },
  {
    timestamps: true,
  }
);
const Contact = model("Message", contactSchema);
export default Contact;
