import type { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { OAuth2Client } from "google-auth-library";
import { errorResponse, successResponse } from "../shared/response";
import User from "../models/user.model";
import config from "../config/config";

const registerNewUser = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body.data;

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
  const { email, password } = req.body.data;
  if (!email || !password) {
    errorResponse({
      res,
      message: "Please provide both email and password",
      statusCode: 400,
    });
    return;
  }
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    errorResponse({
      res,
      message: "Invalid email or password",
      statusCode: 400,
    });
    return;
  }
  if (!user.password) {
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

const client = new OAuth2Client(config.google_client_id);
const googleLogin = asyncHandler(async (req: Request, res: Response) => {
  const { idToken } = req.body.data;

  if (!idToken) {
    errorResponse({
      res,
      message: "Google ID token is required",
      statusCode: 400,
    });
    return;
  }

  let ticket;
  try {
    ticket = await client.verifyIdToken({
      idToken,
      audience: config.google_client_id,
    });
  } catch (error) {
    errorResponse({
      res,
      message: "Invalid Google ID token",
      statusCode: 400,
    });
    return;
  }

  const payload = ticket.getPayload();
  if (!payload) {
    errorResponse({
      res,
      message: "Invalid Google ID token payload",
      statusCode: 400,
    });
    return;
  }
  // ! profile here is used to get the profile picture of the user
  // ? Add it to the user model after updating the user schema
  const { email, name, profile } = payload;
  console.log("🚀 ~ googleLogin ~ profile:", profile);
  if (!email || !name) {
    errorResponse({
      res,
      message: "Google ID token must contain email and name",
      statusCode: 400,
    });
    return;
  }

  let user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    user = new User({
      name,
      email: email.toLowerCase(),
      isGoogleUser: true,
    });
    await user.save();
  }

  const token = user.generateAuthToken();
  successResponse({
    res,
    data: { token, user: { id: user._id, name: user.name, email: user.email } },
    message: "User logged in successfully",
    statusCode: 200,
  });
});

export { registerNewUser, loginUser, googleLogin };
