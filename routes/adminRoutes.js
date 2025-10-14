import { Router } from "express";
import { verifyAdmin } from "../middlewares/checkAuth.js";
import Owner from "../models/ownerModel.js";
import mongoose from "mongoose";

const adminRouter = Router();
const _id = process.env.ADMIN_ID;
const validateStringArray = (arr) =>
  Array.isArray(arr) && !arr.some((s) => typeof s !== "string" || !s.trim()) && arr.length !== 0;

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

// For tweetIds Update
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

export default adminRouter;
