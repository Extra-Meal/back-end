import type { Request, Response } from "express";
import User from "../models/user.model";
import asyncHandler from "express-async-handler";
import { errorResponse, successResponse } from "../shared/response";

const registerNewUser = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    errorResponse({
      res,
      message: "Please provide all required fields: name, email, and password",
      statusCode: 400,
    });
    return;
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    errorResponse({
      res,
      message: "User with this email already exists",
      statusCode: 400,
    });
    return;
  }

  const user = new User({
    name,
    email: email.toLowerCase(),
    password,
  });

  await user.save();
  const token = user.generateAuthToken();

  successResponse({
    res,
    data: { token, user: { id: user._id, name: user.name, email: user.email } },
    message: "User registered successfully",
    statusCode: 201,
  });
});

const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    errorResponse({
      res,
      message: "Invalid email or password",
      statusCode: 400,
    });
    return;
  }
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    errorResponse({
      res,
      message: "Invalid email or password",
      statusCode: 400,
    });
    return;
  }
  const token = user.generateAuthToken();
  successResponse({
    res,
    data: { token, user: { id: user._id, name: user.name, email: user.email } },
    message: "User logged in successfully",
    statusCode: 200,
  });
});

export { registerNewUser, loginUser };
