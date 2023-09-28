import Course from "../model/courseSchema.js";
import AppError from "../utils/error.util.js";
import cloudinary from "cloudinary";
import fs from "fs/promises";

const getAllCourses = async (req, res, next) => {
  try {
    const courses = await Course.find({}).select("-lectures");
    res.status(200).json({
      success: true,
      message: "All courses",
      courses,
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
};

const getLecturesByCourseId = async (req, res, next) => {
  try {
    const { id } = req.params;
    const course = await Course.findById(id);
    if (!course) {
      return next(
        new AppError("Course does not exist by the requested id", 400)
      );
    }
    res.status(200).json({
      success: true,
      message: "Course Lecture Fetched Successfully",
      lectures: course.lectures,
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
};

const createCourse = async (req, res, next) => {
  try {
    const { title, description, category, createdBy } = req.body;

    if (!title || !description || !category || !createdBy) {
      return next(new AppError("All fields are Required", 400));
    }

    const course = await Course.create({
      title,
      description,
      category,
      createdBy,
      thumbnail: {
        public_id: "Dummy",
        secure_url: "Dummy",
      },
    });
    if (!course) {
      return next(
        new AppError(" Course Could'nt be created,Please Try Again", 500)
      );
    }
    if (req.file) {
      try {
        const result = await cloudinary.v2.uploader.upload(req.file.path, {
          folder: "lms",
        });

        if (result) {
          course.thumbnail.public_id = result.public_id;
          course.thumbnail.secure_url = result.secure_url;
          //Remove file from server
          fs.rm(`uploads/${req.file.filename}`);
        }
      } catch (error) {
        return next(
          new AppError(error || "File not uploaded, please try again", 500)
        );
      }
    }

    await course.save();
    res.status(200).json({
      success: true,
      message: "Course Created Successfully",
      course,
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

const updateCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const course = await Course.findByIdAndUpdate(
      id,
      {
        $set: req.body,
      },
      {
        runValidators: true,
      }
    );
    if (!course) {
      return next(new AppError("Course with given Id does not exist", 500));
    }
    res.json({
      success: true,
      message: "Course Updated Successfully",
      course,
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

const removeCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const course = await Course.findById(id);
    if (!course) {
      return next(new AppError("Course with given Id does not exist", 500));
    }
    await Course.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Course Deleted Successfully",
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};
const addLecturesToCourseById = async (req, res, next) => {
  try {
    const { title, description } = req.body;
    const { id } = req.params;
    if (!title || !description) {
      return next(new AppError("All fields are Required", 400));
    }
    const course = await Course.findById(id);
    if (!course) {
      return next(new AppError("Course with given Id does Not exist", 500));
    }
    const lectureData = {
      title,
      description,
      lecture: {
        public_id: "Dummy",
        secure_url: "Dummy",
      },
    };

    if (req.file) {
      try {
        const result = await cloudinary.v2.uploader.upload(req.file.path, {
          folder: "lms",
          chunk_size: 50000000,
          resource_type: "video",
        });

        if (result) {
          lectureData.lecture.public_id = result.public_id;
          lectureData.lecture.secure_url = result.secure_url;
          //Remove file from server
          fs.rm(`uploads/${req.file.filename}`);
        }
      } catch (error) {
        return next(
          new AppError(error || "File not uploaded, please try again", 500)
        );
      }
      course.lectures.push(lectureData);
      course.numberOfLectures = course.lectures.length;
      await course.save();

      res.status(200).json({
        success: true,
        message: "Lecture Successfully added to the course",
        course,
      });
    }
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};
const deleteLecturesFromCourseById = async (req, res, next) => {
  try {
    const { id, lectureid } = req.params;
    const course = await Course.findById(id);
    if (!course) {
      return next(new AppError("Course with given Id does Not exist", 500));
    }

    const lectureIndex = course.lectures.findIndex(
      (lecture) => lecture._id.toString() === lectureid.toString()
    );
    await cloudinary.v2.uploader.destroy(
      course.lectures[lectureIndex].lecture.public_id,
      {
        resource_type: "video",
      }
    );

    const lecture = course.lectures.filter((e) => {
      if (e._id != lectureid) return e;
    });
    course.lectures = lecture;
    course.numberOfLectures = course.lectures.length;
    await course.save();

    res.status(200).json({
      success: true,
      message: "Lecture Deleted Successfully",
      course,
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};
export {
  getAllCourses,
  getLecturesByCourseId,
  createCourse,
  updateCourse,
  removeCourse,
  addLecturesToCourseById,
  deleteLecturesFromCourseById,
};
