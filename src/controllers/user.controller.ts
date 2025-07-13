import asyncHandler from "express-async-handler";
import User from "../models/user.model";
import { errorResponse, successResponse } from "../shared/response";

const updateUser = asyncHandler(async (req, res) => {
  try {
    const userId = req.params.id;
    const updateData = req.body;

    if (!userId || !updateData) {
      errorResponse({
        res,
        message: "User ID and update data are required",
        statusCode: 400,
      });
    }

    if (updateData.email) {
      errorResponse({
        res,
        message: "Email cannot be updated",
        statusCode: 400,
      });
      return;
    }

    if (req.file) {
      // If an avatar is uploaded, add it to the update data
      updateData.avatar = req.file.path;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });

    if (!updatedUser) {
      errorResponse({
        res,
        message: "User not found",
        statusCode: 404,
      });
      return;
    }

    successResponse({
      res,
      message: "User updated successfully",
      data: updatedUser,
    });
    return;
  } catch (error) {
    errorResponse({
      res,
      message: "Error updating user",
      statusCode: 500,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

const deleteUser = asyncHandler(async (req, res) => {
  try {
    const userId = req.params.id;

    if (!userId) {
      errorResponse({
        res,
        message: "User ID is required",
        statusCode: 400,
      });
      return;
    }

    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      errorResponse({
        res,
        message: "User not found",
        statusCode: 404,
      });
      return;
    }

    successResponse({
      res,
      message: "User deleted successfully",
      data: deletedUser,
    });
    return;
  } catch (error) {
    errorResponse({
      res,
      message: "Error deleting user",
      statusCode: 500,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

const getUserById = asyncHandler(async (req, res) => {
  try {
    const userId = req.params.id;

    if (!userId) {
      errorResponse({
        res,
        message: "User ID is required",
        statusCode: 400,
      });
      return;
    }

    const user = await User.findById(userId);

    if (!user) {
      errorResponse({
        res,
        message: "User not found",
        statusCode: 404,
      });
      return;
    }

    successResponse({
      res,
      message: "User retrieved successfully",
      data: user,
    });
    return;
  } catch (error) {
    errorResponse({
      res,
      message: "Error retrieving user",
      statusCode: 500,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

const getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search = "" } = req.query;
  const skip = (Number(page) - 1) * Number(limit);
  const paginationOptions = {
    skip,
    limit: Number(limit),
  };
  try {
    const projection = {
      avatar: 1,
      name: 1,
      email: 1,
      phone: 1,
      address: 1,
      roles: 1,
      isVerified: 1,
      isGoogleUser: 1,
    };
    const users = await User.find({}, {}, paginationOptions).select(projection).sort({ createdAt: -1 });
    const totalUsers = await User.countDocuments();

    successResponse({
      res,
      message: "Users retrieved successfully",
      data: {
        users,
        pagination: {
          total: totalUsers,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(totalUsers / Number(limit)),
        },
      },
    });
    return;
  } catch (error) {
    errorResponse({
      res,
      message: "Error retrieving users",
      statusCode: 500,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

const getUserByEmail = asyncHandler(async (req, res) => {
  try {
    const email = req.params.email;

    if (!email) {
      errorResponse({
        res,
        message: "Email is required",
        statusCode: 400,
      });
      return;
    }

    const user = await User.findOne({ email });

    if (!user) {
      errorResponse({
        res,
        message: "User not found",
        statusCode: 404,
      });
      return;
    }

    successResponse({
      res,
      message: "User retrieved successfully",
      data: user,
    });
    return;
  } catch (error) {
    errorResponse({
      res,
      message: "Error retrieving user by email",
      statusCode: 500,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

const getMydata = asyncHandler(async (req, res) => {
  try {
    const userId = req.user?._id;

    const user = await User.findById(userId);

    if (!user) {
      errorResponse({
        res,
        message: "User not found",
        statusCode: 404,
      });
      return;
    }

    successResponse({
      res,
      message: "User data retrieved successfully",
      data: user,
    });
    return;
  } catch (error) {
    errorResponse({
      res,
      message: "Error retrieving user data",
      statusCode: 500,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

const updateUserRoles = asyncHandler(async (req, res) => {
  try {
    const userId = req.params.id;
    const { roles } = req.body;

    if (!userId) {
      errorResponse({
        res,
        message: "User ID id required",
        statusCode: 400,
      });
      return;
    }

    if (!roles || !Array.isArray(roles) || roles.length < 1) {
      errorResponse({
        res,
        message: "Roles must be a non-empty array",
        statusCode: 400,
      });
      return;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, { roles }, { new: true });

    if (!updatedUser) {
      errorResponse({
        res,
        message: "User not found",
        statusCode: 404,
      });
      return;
    }

    successResponse({
      res,
      message: "User roles updated successfully",
      data: updatedUser,
    });
    return;
  } catch (error) {
    errorResponse({
      res,
      message: "Error updating user roles",
      statusCode: 500,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

const changeUserAvatar = asyncHandler(async (req, res) => {
  try {
    const userId = req.params.id;

    if (!userId) {
      errorResponse({
        res,
        message: "User ID is required",
        statusCode: 400,
      });
      return;
    }

    if (!req.file) {
      errorResponse({
        res,
        message: "Avatar file is required",
        statusCode: 400,
      });
      return;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, { avatar: req.file.path }, { new: true });

    if (!updatedUser) {
      errorResponse({
        res,
        message: "User not found",
        statusCode: 404,
      });
      return;
    }

    successResponse({
      res,
      message: "User avatar updated successfully",
      data: updatedUser,
    });
    return;
  } catch (error) {
    errorResponse({
      res,
      message: "Error updating user avatar",
      statusCode: 500,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export {
  updateUser,
  deleteUser,
  getUserById,
  getAllUsers,
  getUserByEmail,
  getMydata,
  updateUserRoles,
  changeUserAvatar,
};
