import { model, Schema } from "mongoose";
const courseSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Title is Required"],
      minLength: [8, "Title must be atleast 8 characters"],
      maxLength: [59, "Title should be less than 60 characters"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Discription is required"],
      minLength: [8, "Description must be atleast 8 characters"],
      maxLength: [200, "Discription should be less than 200 characters"],
    },
    category: {
      type: String,
      required: [true, "Category is Required"],
    },
    thumbnail: {
      public_id: {
        type: String,
        required: true,
      },
      secure_url: {
        type: String,
        required: true,
      },
    },
    lectures: [
      {
        title: String,
        description: String,
        lecture: {
          public_id: {
            type: String,
            required: true,
          },
          secure_url: {
            type: String,
            required: true,
          },
          //select: false,
        },
        //select: false,
      },
      //{
      //  select: true,
      //},
    ],
    numberOfLectures: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
const Course = model("Course", courseSchema);
export default Course;
