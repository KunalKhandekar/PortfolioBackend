import mongoose from "mongoose";
import path from "path";
import Achievement from "../models/AchievementModel.js";
import Blog from "../models/BlogModel.js";
import Experience from "../models/ExperienceModel.js";
import Owner from "../models/ownerModel.js";
import Project from "../models/ProjectModel.js";
import { sendEmail } from "../services/resend.js";
import {
  deleteS3Object,
  generatePreSignedUploadURL,
} from "../services/s3Services.js";

const _id = process.env.ADMIN_ID;

// About Controllers
export const createAboutController = async (req, res) => {
  try {
    const owner = await Owner.create(req.body || {});
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
};

export const getAboutController = async (_, res) => {
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
};

export const updateAboutController = async (req, res) => {
  try {
    if (Object.entries(req.body).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided to update",
      });
    }

    const ownerData = await Owner.findById(_id).lean();

    if (!ownerData) {
      return res.status(404).json({
        success: false,
        message: "Owner data not found",
      });
    }

    if (req.body.profilePic) {
      if (ownerData.profilePic) {
        const key = ownerData.profilePic.split("/").pop();
        await deleteS3Object({ Key: key });
      }
    }

    const updatedOwner = await Owner.findByIdAndUpdate(_id, req.body, {
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
};

// Twitter Controller
export const updateTweetIds = async (req, res) => {
  try {
    const ownerData = await Owner.findByIdAndUpdate(_id, req.body, {
      new: true,
    });

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
};

export const getTweetIds = async (req, res) => {
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
};

// Blog Controller
export const createBlogController = async (req, res) => {
  try {
    const blog = await Blog.create(req.body);

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
};

export const getBlogsController = async (_, res) => {
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
};

export const updateBlogByIdController = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid blog ID",
      });
    }

    if (Object.keys(req.body).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided to update",
      });
    }

    const updatedBlog = await Blog.findByIdAndUpdate(id, req.body, {
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
};

// Experience Controller
export const createExperienceController = async (req, res) => {
  try {
    const experience = await Experience.create(req.body);
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
};

export const getExperienceController = async (req, res) => {
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
};

export const updateExperienceController = async (req, res) => {
  try {
    const { id } = req.params;

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

    if (Object.keys(req.body).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided to update",
      });
    }

    if (req.body.companyLogo) {
      if (experience.companyLogo) {
        const key = experience.companyLogo.split("/").pop();
        await deleteS3Object({ Key: key });
      }
    }

    const updatedExperience = await Experience.findByIdAndUpdate(id, req.body, {
      new: true,
    });

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
};

// Achievement Controller
export const createAchievementController = async (req, res) => {
  try {
    const achievement = await Achievement.create(req.body);
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
};

export const getAchievementController = async (_, res) => {
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
};

export const updateAchievementController = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid achievement ID",
      });
    }

    if (Object.keys(req.body).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided to update",
      });
    }

    const achievement = await Achievement.findById(id);
    if (!achievement) {
      return res.status(404).json({
        success: false,
        message: "Achievement not found",
      });
    }

    if (req.body.companyLogo) {
      if (achievement.companyLogo) {
        const key = achievement.companyLogo.split("/").pop();
        await deleteS3Object({ Key: key });
      }
    }

    if (req.body.images) {
      const oldImages = achievement.images || [];
      const imagesToDelete = oldImages.filter((img) => !images.includes(img));
      for (const imgUrl of imagesToDelete) {
        const key = imgUrl.split("/").pop();
        await deleteS3Object({ Key: key });
      }
    }

    const updatedAchievement = await Achievement.findByIdAndUpdate(
      id,
      req.body,
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
};

export const createSignedURLController = async (req, res) => {
  try {
    const { fileName, contentType } = req.body || {};

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
};

// Project Controller
export const createProjectController = async (req, res) => {
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
};

export const getProjectController = async (_, res) => {
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
};

export const getProjectByNavLinkController = async (req, res) => {
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
};

export const updateProjectController = async (req, res) => {
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
};

export const getProjectsListController = async (_, res) => {
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
};

export const getProjectLanguagesController = async (req, res) => {
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
};

// Overview Controllers
export const getOverviewController = async (req, res) => {
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
};

// Search Controller
export const getSearchListController = async (req, res) => {
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
};

// Contact Form Controller
export const createContactFormController = async (req, res) => {
  try {
    const { name, email, message } = req.body || {};

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
};
