import { Router } from "express";
import mongoose from "mongoose";
import path from "path";
import { verifyAdmin } from "../middlewares/checkAuth.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import Achievement from "../models/AchievementModel.js";
import Blog from "../models/BlogModel.js";
import Experience from "../models/ExperienceModel.js";
import Owner from "../models/ownerModel.js";
import Project from "../models/ProjectModel.js";
import {
  deleteS3Object,
  generatePreSignedUploadURL,
} from "../services/s3Services.js";
import {
  projectCreateSchema,
  projectUpdateSchema,
} from "../validators/projectValidators.js";
import { sendEmail } from "../services/resend.js";

const adminRouter = Router();
const _id = process.env.ADMIN_ID;
const validateStringArray = (arr) =>
  Array.isArray(arr) &&
  !arr.some((s) => typeof s !== "string" || !s.trim()) &&
  arr.length !== 0;

// About Routes
adminRouter.get("/about", async (req, res) => {
  try {
    const ownerData = await Owner.findById(_id).lean();

    if (!ownerData) {
      return res.status(404).json({
        success: false,
        message: "Owner data not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Owner data retrieved successfully",
      data: {
        name: ownerData.name,
        role: ownerData.role,
        miniDescription: ownerData.miniDescription,
        description: ownerData.description,
        currentFocus: ownerData.currentFocus,
        skills: ownerData.skills,
        profilePic: ownerData.profilePic,
        aboutReadme: ownerData.aboutReadme,
      },
    });
  } catch (error) {
    console.error("Error fetching owner data:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

adminRouter.post("/about", verifyAdmin, async (req, res) => {
  try {
    const {
      profilePic,
      name,
      role,
      miniDescription,
      description,
      currentFocus,
      skills,
      tweetIds,
      aboutReadme,
    } = req.body || {};

    const requiredFields = {
      profilePic,
      name,
      role,
      miniDescription,
      description,
      currentFocus,
      skills,
      tweetIds,
      aboutReadme,
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([key, value]) => !value)
      .map(([key]) => key);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    if (!validateStringArray(skills)) {
      return res.status(400).json({
        success: false,
        message: "Skills must be an array of non-empty strings",
      });
    }

    if (!validateStringArray(tweetIds)) {
      return res.status(400).json({
        success: false,
        message: "tweetIds must be an array of non-empty strings",
      });
    }

    const owner = await Owner.create({
      profilePic,
      name,
      role,
      miniDescription,
      description,
      currentFocus,
      skills,
      tweetIds,
      aboutReadme,
    });

    return res.status(200).json({
      success: true,
      message: "Owner details added",
      data: owner,
    });
  } catch (error) {
    console.error("Error while creating owner:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

adminRouter.patch("/about", verifyAdmin, async (req, res) => {
  try {
    const {
      profilePic,
      name,
      role,
      mainDescription,
      description,
      currentFocus,
      skills,
      aboutReadme,
    } = req.body || {};
    const ownerData = await Owner.findById(_id).lean();

    if (!ownerData) {
      return res.status(404).json({
        success: false,
        message: "Owner data not found",
      });
    }

    const updateData = {};

    if (profilePic) {
      if (ownerData.profilePic) {
        const keyParts = ownerData.profilePic.split("/");
        const oldKey = keyParts[keyParts.length - 1];
        await deleteS3Object({ Key: oldKey });
      }
      updateData.profilePic = profilePic;
    }
    if (name) updateData.name = name;
    if (role) updateData.role = role;
    if (mainDescription) updateData.miniDescription = mainDescription;
    if (description) updateData.description = description;
    if (currentFocus) updateData.currentFocus = currentFocus;

    if (skills) {
      if (
        !Array.isArray(skills) ||
        skills.some((s) => typeof s !== "string" || !s.trim())
      ) {
        return res.status(400).json({
          success: false,
          message: "Skills must be an array of non-empty strings",
        });
      }
      updateData.skills = skills;
    }

    if (aboutReadme) updateData.aboutReadme = aboutReadme;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided to update",
      });
    }

    const updatedOwner = await Owner.findByIdAndUpdate(_id, updateData, {
      new: true,
    }).lean();

    return res.status(200).json({
      success: true,
      message: "Owner details updated successfully",
      data: updatedOwner,
    });
  } catch (error) {
    console.error("Error updating owner data:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Twitter Routes
adminRouter.patch("/tweetIds", verifyAdmin, async (req, res) => {
  try {
    const { tweetIds } = req.body || {};

    if (!tweetIds)
      return res
        .status(400)
        .json({ success: false, message: "Missing required field tweetIds." });

    if (!validateStringArray(tweetIds))
      return res.status(400).json({
        success: false,
        message: "tweetIds must be an array of non-empty strings",
      });

    const ownerData = await Owner.findByIdAndUpdate(
      _id,
      {
        tweetIds,
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Tweets Updated",
      data: ownerData.tweetIds,
    });
  } catch (error) {
    console.error("Error updating tweet data:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

adminRouter.get("/tweetIds", async (req, res) => {
  try {
    const tweetIds = await Owner.findById(_id).select("tweetIds").lean();

    if (!tweetIds) {
      return res.status(400).json({
        success: false,
        message: "No tweetIds found !",
      });
    }

    return res.status(200).json({
      success: true,
      data: tweetIds,
    });
  } catch (error) {
    console.error("Error getting tweet data:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Blog Route
adminRouter.post("/blog", verifyAdmin, async (req, res) => {
  try {
    const { title, excerpt, date, readTime, category, mediumLink } =
      req.body || {};

    const requiredFields = {
      title,
      excerpt,
      date,
      readTime,
      category,
      mediumLink,
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([key, value]) => !value)
      .map(([key]) => key);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    const blog = await Blog.create({
      title,
      excerpt,
      date,
      readTime,
      category,
      mediumLink,
    });

    return res.status(200).json({
      success: true,
      message: "New blog added successfully",
      data: blog,
    });
  } catch (error) {
    console.error("Error creating blog: ", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

adminRouter.patch("/blog/:id", verifyAdmin, async (req, res) => {
  try {
    const { title, excerpt, date, readTime, category, mediumLink } =
      req.body || {};

    const { id } = req.params;
    const updateData = {};

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid blog ID",
      });
    }

    if (title) updateData.title = title;
    if (excerpt) updateData.excerpt = excerpt;
    if (date) updateData.date = date;
    if (readTime) updateData.readTime = readTime;
    if (category) updateData.category = category;
    if (mediumLink) updateData.mediumLink = mediumLink;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided to update",
      });
    }

    const updatedBlog = await Blog.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updatedBlog) {
      return res.status(404).json({
        success: false,
        message: "Blog data not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Blog data updated successfully",
      data: updatedBlog,
    });
  } catch (error) {
    console.error("Error updating blog data: ", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

adminRouter.get("/blog", async (req, res) => {
  try {
    const blogs = await Blog.find({}).lean();

    return res.status(200).json({
      success: true,
      message:
        blogs.length > 0 ? "Blogs fetched successfully" : "No blogs found",
      data: blogs,
    });
  } catch (error) {
    console.error("Error getting blogs data: ", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Experience Route
adminRouter.post("/experience", verifyAdmin, async (req, res) => {
  try {
    const {
      companyLogo,
      title,
      location,
      timeLine,
      isCurrent,
      keyAchievements,
      technologiesUsed,
    } = req.body || {};

    const requiredFields = {
      companyLogo,
      title,
      location,
      timeLine,
      isCurrent,
      keyAchievements,
      technologiesUsed,
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([key, value]) => value === undefined || value === null)
      .map(([key]) => key);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    if (!validateStringArray(keyAchievements)) {
      return res.status(400).json({
        success: false,
        message: "keyAchievements must be an array of non-empty strings",
      });
    }

    if (!validateStringArray(technologiesUsed)) {
      return res.status(400).json({
        success: false,
        message: "technologiesUsed must be an array of non-empty strings",
      });
    }

    const experience = await Experience.create({
      companyLogo,
      title,
      location,
      timeLine,
      isCurrent,
      keyAchievements,
      technologiesUsed,
    });

    return res.status(200).json({
      success: true,
      message: "New experience added successfully",
      data: experience,
    });
  } catch (error) {
    console.error("Error creating experience: ", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

adminRouter.patch("/experience/:id", verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      companyLogo,
      title,
      location,
      timeLine,
      isCurrent,
      keyAchievements,
      technologiesUsed,
    } = req.body || {};

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid experience ID",
      });
    }

    const experience = await Experience.findById(id);
    if (!experience) {
      return res.status(404).json({
        success: false,
        message: "Experience not found",
      });
    }

    const updateData = {};

    if (companyLogo) {
      if (experience.companyLogo) {
        const keyParts = experience.companyLogo.split("/");
        const oldKey = keyParts[keyParts.length - 1];
        await deleteS3Object({ Key: oldKey });
      }
      updateData.companyLogo = companyLogo;
    }

    if (title) updateData.title = title;
    if (location) updateData.location = location;
    if (timeLine) updateData.timeLine = timeLine;
    if (isCurrent !== undefined && isCurrent !== null)
      updateData.isCurrent = isCurrent;

    if (keyAchievements) {
      if (!validateStringArray(keyAchievements)) {
        return res.status(400).json({
          success: false,
          message: "keyAchievements must be an array of non-empty strings",
        });
      }
      updateData.keyAchievements = keyAchievements;
    }

    if (technologiesUsed) {
      if (!validateStringArray(technologiesUsed)) {
        return res.status(400).json({
          success: false,
          message: "technologiesUsed must be an array of non-empty strings",
        });
      }
      updateData.technologiesUsed = technologiesUsed;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided to update",
      });
    }

    const updatedExperience = await Experience.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Experience updated successfully",
      data: updatedExperience,
    });
  } catch (error) {
    console.error("Error updating experience: ", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

adminRouter.get("/experience", async (req, res) => {
  try {
    const experiences = await Experience.find({}).lean();

    return res.status(200).json({
      success: true,
      message:
        experiences.length > 0
          ? "Experience data fetched successfully"
          : "No experience data found",
      data: experiences,
    });
  } catch (error) {
    console.error("Error getting experience data: ", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Achievements Route
adminRouter.post("/achievement", verifyAdmin, async (req, res) => {
  try {
    const {
      companyLogo,
      title,
      timeLine,
      descriptionTitle,
      descriptionPoints,
      images,
    } = req.body || {};

    const requiredFields = {
      companyLogo,
      title,
      timeLine,
      descriptionTitle,
      descriptionPoints,
      images,
    };

    const missingFields = Object.entries(requiredFields)
      .filter(
        ([_, value]) => value === undefined || value === null || value === ""
      )
      .map(([key]) => key);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    if (!validateStringArray(descriptionPoints)) {
      return res.status(400).json({
        success: false,
        message: "descriptionPoints must be an array of non-empty strings",
      });
    }

    if (!validateStringArray(images)) {
      return res.status(400).json({
        success: false,
        message: "images must be an array of links",
      });
    }

    if (images.length > 2) {
      return res.status(400).json({
        success: false,
        message: "Maximum 2 images per achievement",
      });
    }

    const achievement = await Achievement.create({
      companyLogo,
      title,
      timeLine,
      descriptionTitle,
      descriptionPoints,
      images,
    });

    return res.status(200).json({
      success: true,
      message: "New achievement added successfully",
      data: achievement,
    });
  } catch (error) {
    console.error("Error creating achievement : ", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

adminRouter.patch("/achievement/:id", verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      companyLogo,
      title,
      timeLine,
      descriptionTitle,
      descriptionPoints,
      images,
    } = req.body || {};

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid achievement ID",
      });
    }

    const achievement = await Achievement.findById(id);
    if (!achievement) {
      return res.status(404).json({
        success: false,
        message: "Achievement not found",
      });
    }

    const updateData = {};

    if (companyLogo) {
      if (achievement.companyLogo) {
        const keyParts = achievement.companyLogo.split("/");
        const oldKey = keyParts[keyParts.length - 1];
        await deleteS3Object({ Key: oldKey });
      }
      updateData.companyLogo = companyLogo;
    }

    if (title) updateData.title = title;
    if (timeLine) updateData.timeLine = timeLine;
    if (descriptionTitle) updateData.descriptionTitle = descriptionTitle;
    if (descriptionPoints) {
      if (!validateStringArray(descriptionPoints)) {
        return res.status(400).json({
          success: false,
          message: "descriptionPoints must be an array of non-empty strings",
        });
      }
      updateData.descriptionPoints = descriptionPoints;
    }

    if (images) {
      if (!validateStringArray(images)) {
        return res.status(400).json({
          success: false,
          message: "images must be an array of non-empty strings",
        });
      }

      if (images.length > 2) {
        return res.status(400).json({
          success: false,
          message: "Maximum 2 images per achievement",
        });
      }

      const oldImages = achievement.images || [];

      const imagesToDelete = oldImages.filter((img) => !images.includes(img));

      for (const imgUrl of imagesToDelete) {
        const key = imgUrl.split("/").pop();
        await deleteS3Object({ Key: key });
      }

      updateData.images = images;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided to update",
      });
    }

    const updatedAchievement = await Achievement.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Achievement updated successfully",
      data: updatedAchievement,
    });
  } catch (error) {
    console.error("Error updating achievement: ", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

adminRouter.get("/achievement", async (req, res) => {
  try {
    const achievements = await Achievement.find({}).lean();

    return res.status(200).json({
      success: true,
      message:
        achievements.length > 0
          ? "Achievement data fetched successfully"
          : "No achievement data found",
      data: achievements,
    });
  } catch (error) {
    console.error("Error getting achievement data: ", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// S3 Routes
adminRouter.post("/getS3UploadURL", async (req, res) => {
  try {
    const { fileName, contentType } = req.body || {};

    if (!fileName || !contentType) {
      return res.status(400).json({
        success: false,
        message: "fileName and contentType are required",
      });
    }

    const allowedTypes = ["image/png", "image/jpeg", "image/webp"];
    if (!allowedTypes.includes(contentType)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid file type" });
    }

    const s3ObjectKey = `${crypto.randomUUID()}${path.extname(fileName)}`;

    const preSignedUploadURL = await generatePreSignedUploadURL({
      ContentType: contentType,
      Key: s3ObjectKey,
    });

    return res.status(200).json({
      success: true,
      data: {
        url: preSignedUploadURL,
        s3ObjectKey,
      },
    });
  } catch (error) {
    console.error("Error creating pre-signed upload URL: ", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Projects Route
adminRouter.post(
  "/project",
  validateRequest(projectCreateSchema),
  async (req, res) => {
    try {
      const project = await Project.create(req.body);
      return res.status(200).json({
        success: true,
        message: "New project added successfully",
        data: project,
      });
    } catch (error) {
      return res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }
);

adminRouter.get("/project", async (req, res) => {
  try {
    const projects = await Project.find({}).lean();

    return res.status(200).json({
      success: true,
      message:
        projects.length > 0
          ? "Project data fetched successfully"
          : "No project data found",
      data: projects,
    });
  } catch (error) {
    console.error("Error getting project data: ", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

adminRouter.get("/project/:navLink", async (req, res) => {
  const { navLink } = req.params || {};
  try {
    const project = await Project.findOne({ navLink }).lean();

    if (!project) {
      return res.status(400).json({
        success: false,
        message: "Project not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Project data fetched successfully",
      data: project,
    });
  } catch (error) {
    console.error("Error getting project data: ", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

adminRouter.patch(
  "/project/:id",
  validateRequest(projectUpdateSchema),
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid project ID",
        });
      }

      if (Object.entries(req.body).length === 0) {
        return res.status(400).json({
          success: false,
          message: "No valid fields provided to update",
        });
      }

      const oldProject = await Project.findById(id);
      if (!oldProject) {
        return res.status(404).json({
          success: false,
          message: "Project not found",
        });
      }

      // Handle Image Deletion only if `images` is included in body
      if (req.body.images) {
        const oldImages = oldProject.images || [];
        const newImages = req.body.images || [];

        const imagesToDelete = oldImages.filter(
          (img) => !newImages.includes(img)
        );

        await Promise.all(
          imagesToDelete.map((imgUrl) => {
            const key = imgUrl.split("/").pop();
            return deleteS3Object({ Key: key });
          })
        );
      }

      const updatedProject = await Project.findByIdAndUpdate(id, req.body, {
        new: true,
      });

      return res.status(200).json({
        success: true,
        message: "Project updated successfully",
        data: updatedProject,
      });
    } catch (error) {
      console.error("Error updating project:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
);

// Overview Content
adminRouter.get("/overview", async (req, res) => {
  try {
    const ownerData = await Owner.findById(_id).select("aboutReadme").lean();

    if (!ownerData) {
      return res.status(404).json({
        success: "false",
        message: "Owner data not found",
      });
    }

    const overviewReadmeContent = ownerData.aboutReadme;
    const projects = await Project.find({})
      .select("name navLink description stack createdAt")
      .sort({ createdAt: -1 })
      .limit(3)
      .lean();
    const blogs = await Blog.find({}).sort({ createdAt: -1 }).limit(3).lean();

    return res.status(200).json({
      success: true,
      message: "Overview data fetched",
      data: {
        readmeContent: overviewReadmeContent,
        pinnedContent: [
          ...projects?.map((proj) => ({
            type: "repo",
            title: proj.name,
            description: proj.description,
            stack: proj.stack,
            readTime: null,
            link: `/projects/${proj.navLink}`,
          })),
          ...blogs?.map((blog) => ({
            type: "blog",
            title: blog.title,
            description: blog.excerpt,
            stack: null,
            readTime: blog.readTime,
            link: blog.mediumLink,
          })),
        ],
      },
    });
  } catch (error) {
    console.error("Error getting overview data: ", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Project Listing
adminRouter.get("/projectsList", async (req, res) => {
  const projects = await Project.find({}).lean();
  res.status(200).json({
    success: true,
    data: projects.map((proj) => ({
      title: proj.name,
      navLink: proj.navLink,
      description: proj.description,
      stack: proj.stack,
      liveLink: proj.liveLink,
      gitHubLink: proj.gitHubLink,
      image: proj.images[0],
      languages: proj.languagesUsed.map((lang) => lang.name),
    })),
  });
});

// Search
adminRouter.get("/search", async (req, res) => {
  const projects = await Project.find({}).lean();
  const blogs = await Blog.find({}).lean();

  res.status(200).json({
    success: true,
    data: [
      {
        key: "Projects",
        value: projects.map((proj) => ({
          id: proj._id,
          name: proj.name,
          navLink: `/projects/${proj.navLink}`,
        })),
      },
      {
        key: "Blogs",
        value: blogs.map((blog) => ({
          id: blog._id,
          name: blog.title,
          navLink: blog.mediumLink,
        })),
      },
      {
        key: "Pages",
        value: [
          { id: 1, name: "Overview", navLink: "/" },
          { id: 2, name: "Projects", navLink: "/projects" },
          { id: 3, name: "Achievements", navLink: "/achievements" },
          { id: 4, name: "Experience", navLink: "/experience" },
          { id: 5, name: "Blogs", navLink: "/blogs" },
          { id: 6, name: "Consistency", navLink: "/consistency" },
          { id: 7, name: "Get in touch", navLink: "/contact" },
        ],
      },
    ],
  });
});

// Languages sorting
adminRouter.get("/languages", async (req, res) => {
  try {
    const languages = await Project.distinct("languagesUsed.name");

    const formatted = [
      { value: "All" },
      ...languages.map((name) => ({ value: name })),
    ];

    return res.status(200).json({
      success: true,
      data: formatted,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Contact form
adminRouter.post("/contact-form", async (req, res) => {
  try {
    const { name, email, message } = req.body || {};

    // Basic validation
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Simple email regex validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    // Send email
    const result = await sendEmail({ name, email, message });

    if (!result || result?.error) {
      return res.status(500).json({
        success: false,
        message: "Failed to send message, please try again later",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Message sent successfully!",
    });
  } catch (error) {
    console.error("Error sending email:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong, please try again later",
    });
  }
});

export default adminRouter;
