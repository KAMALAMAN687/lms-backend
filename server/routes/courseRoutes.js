import { Router } from "express";
import upload from "../middleware/multer.middleware.js";
import isLoggedIn from "../middleware/auth.middleware.js";
import authorizedRoles from "../middleware/Author.middleware.js";
import {
  getAllCourses,
  getLecturesByCourseId,
  updateCourse,
  removeCourse,
  createCourse,
  addLecturesToCourseById,
  deleteLecturesFromCourseById,
} from "../controllers/coursecontroller.js";
import authorizedSubscriber from "../middleware/authorizedSubscriber.js";

const courseRouter = Router();

courseRouter
  .route("/")
  .get(getAllCourses)
  .post(
    isLoggedIn,
    authorizedRoles("ADMIN"),
    upload.single("thumbnail"),
    createCourse
  );
courseRouter
  .route("/:id")
  .get(isLoggedIn, authorizedSubscriber, getLecturesByCourseId)
  .put(isLoggedIn, authorizedRoles("ADMIN"), updateCourse)
  .delete(isLoggedIn, authorizedRoles("ADMIN"), removeCourse)
  .post(
    isLoggedIn,
    authorizedRoles("ADMIN"),
    upload.single("lecture"),
    addLecturesToCourseById
  );
courseRouter
  .route("/:id/:lectureid")
  .put(isLoggedIn, authorizedRoles("ADMIN"), deleteLecturesFromCourseById);

export default courseRouter;
