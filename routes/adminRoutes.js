import { Router } from "express";
import { verifyAdmin } from "../middlewares/checkAuth.js";
import Owner from "../models/ownerModel.js";
import mongoose, { Schema } from "mongoose";
import Blog from "../models/BlogModel.js";
import Experience from "../models/ExperienceModel.js";

const adminRouter = Router();
const _id = process.env.ADMIN_ID;
const validateStringArray = (arr) =>
  Array.isArray(arr) &&
  !arr.some((s) => typeof s !== "string" || !s.trim()) &&
  arr.length !== 0;

// About Routes
adminRouter.get("/about", verifyAdmin, async (req, res) => {
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
      name,
      role,
      miniDescription,
      description,
      currentFocus,
      skills,
      tweetIds,
    } = req.body || {};

    const requiredFields = {
      name,
      role,
      miniDescription,
      description,
      currentFocus,
      skills,
      tweetIds,
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
      name,
      role,
      miniDescription,
      description,
      currentFocus,
      skills,
      tweetIds,
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
    const { name, role, mainDescription, description, currentFocus, skills } =
      req.body || {};

    const updateData = {};

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

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided to update",
      });
    }

    const updatedOwner = await Owner.findByIdAndUpdate(_id, updateData, {
      new: true,
    }).lean();

    if (!updatedOwner) {
      return res.status(404).json({
        success: false,
        message: "Owner data not found",
      });
    }

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

adminRouter.get("/tweetIds", verifyAdmin, async (req, res) => {
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

adminRouter.get("/blog", verifyAdmin, async (req, res) => {
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
    const {
      companyLogo,
      title,
      location,
      timeLine,
      isCurrent,
      keyAchievements,
      technologiesUsed,
    } = req.body || {};

    const { id } = req.params;
    const updateData = {};

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid experience ID",
      });
    }

    if (companyLogo) updateData.companyLogo = companyLogo;
    if (title) updateData.title = title;
    if (location) updateData.location = location;
    if (timeLine) updateData.timeLine = timeLine;
    if (isCurrent !== undefined && isCurrent !== null) {
      updateData.isCurrent = isCurrent;
    }
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
      {
        new: true,
      }
    );

    if (!updatedExperience) {
      return res.status(404).json({
        success: false,
        message: "Experience data not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Experience data updated successfully",
      data: updatedExperience,
    });
  } catch (error) {
    console.error("Error updating experience data: ", error);
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

export default adminRouter;
