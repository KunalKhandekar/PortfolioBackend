import { Router } from "express";
import {
  createAboutController,
  createAchievementController,
  createBlogController,
  createContactFormController,
  createExperienceController,
  createProjectController,
  createSignedURLController,
  getAboutController,
  getAchievementController,
  getBlogsController,
  getExperienceController,
  getOverviewController,
  getProjectByNavLinkController,
  getProjectController,
  getProjectLanguagesController,
  getProjectsListController,
  getSearchListController,
  getTweetIds,
  updateAboutController,
  updateAchievementController,
  updateBlogByIdController,
  updateExperienceController,
  updateProjectController,
  updateTweetIds,
} from "../controllers/adminController.js";
import { verifyAdmin } from "../middlewares/checkAuth.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import {
  aboutCreateSchema,
  aboutUpdateSchema,
  createAchievementSchema,
  createBlogSchema,
  createContactSchema,
  createExperienceSchema,
  createSignedURLSchema,
  projectCreateSchema,
  projectUpdateSchema,
  tweetIdsSchema,
  updateAchievementSchema,
  updateBlogSchema,
  updateExperienceSchema,
} from "../validators/index.js";

const adminRouter = Router();

// About Routes
adminRouter.get("/about", getAboutController);

adminRouter.post(
  "/about",
  verifyAdmin,
  validateRequest(aboutCreateSchema),
  createAboutController
);

adminRouter.patch(
  "/about",
  verifyAdmin,
  validateRequest(aboutUpdateSchema),
  updateAboutController
);

// Twitter Routes
adminRouter.patch(
  "/tweetIds",
  verifyAdmin,
  validateRequest(tweetIdsSchema),
  updateTweetIds
);

adminRouter.get("/tweetIds", getTweetIds);

// Blog Route
adminRouter.post(
  "/blog",
  verifyAdmin,
  validateRequest(createBlogSchema),
  createBlogController
);

adminRouter.patch(
  "/blog/:id",
  verifyAdmin,
  validateRequest(updateBlogSchema),
  updateBlogByIdController
);

adminRouter.get("/blog", getBlogsController);

// Experience Route
adminRouter.post(
  "/experience",
  verifyAdmin,
  validateRequest(createExperienceSchema),
  createExperienceController
);

adminRouter.patch(
  "/experience/:id",
  verifyAdmin,
  validateRequest(updateExperienceSchema),
  updateExperienceController
);

adminRouter.get("/experience", getExperienceController);

// Achievements Route
adminRouter.post(
  "/achievement",
  verifyAdmin,
  validateRequest(createAchievementSchema),
  createAchievementController
);

adminRouter.patch(
  "/achievement/:id",
  verifyAdmin,
  validateRequest(updateAchievementSchema),
  updateAchievementController
);

adminRouter.get("/achievement", getAchievementController);

// S3 Routes
adminRouter.post(
  "/getS3UploadURL",
  verifyAdmin,
  validateRequest(createSignedURLSchema),
  createSignedURLController
);

// Projects Route
adminRouter.post(
  "/project",
  verifyAdmin,
  validateRequest(projectCreateSchema),
  createProjectController
);

adminRouter.get("/project", getProjectController);

adminRouter.get("/project/:navLink", getProjectByNavLinkController);

adminRouter.patch(
  "/project/:id",
  verifyAdmin,
  validateRequest(projectUpdateSchema),
  updateProjectController
);

adminRouter.get("/projectsList", getProjectsListController);

adminRouter.get("/languages", getProjectLanguagesController);

// Overview Content
adminRouter.get("/overview", getOverviewController);

// Search
adminRouter.get("/search", getSearchListController);

// Contact form
adminRouter.post(
  "/contact-form",
  validateRequest(createContactSchema),
  createContactFormController
);

export default adminRouter;
