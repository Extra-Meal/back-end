import type { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { OAuth2Client } from "google-auth-library";
import { errorResponse, successResponse } from "../shared/response";
import User from "../models/user.model";
import config from "../config/config";
import axios from "axios";
import { sendEmail } from "../shared/emails/mailService";
import { verifyEmailMessage } from "../shared/emails/mailTemplates";
import { generateEmailVerificationToken } from "../shared/tokens";

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
  const verificationToken = generateEmailVerificationToken();
  const user = new User({
    name,
    email: email.toLowerCase(),
    password,
    emailVerificationToken: verificationToken,
    isVerified: false,
  });

  await user.save();
  const isEmailSent = sendEmail(user.email, "Welcome to Mealify", verifyEmailMessage(verificationToken));
  if (!isEmailSent) {
    errorResponse({
      res,
      message: "Failed to send verification email",
      statusCode: 500,
    });
    return;
  }
  const maskedEmail = user.email.replace(/(.{2})(.*)(?=@)/, (_, p1, p2) => p1 + "*".repeat(p2.length));
  successResponse({
    res,
    data: null,
    message: `User registered successfully. A verification email has been sent to ${maskedEmail}. Please check your inbox to verify your email.`,
    statusCode: 201,
  });
});

const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const verificationToken = req.body;

  if (!verificationToken) {
    errorResponse({
      res,
      message: "Email verification token is required",
      statusCode: 400,
    });
    return;
  }

  const user = await User.findOne({ emailVerificationToken: verificationToken });
  if (!user) {
    errorResponse({
      res,
      message: "Invalid or expired email verification token",
      statusCode: 400,
    });
    return;
  }

  user.isVerified = true;
  user.emailVerificationToken = null;
  const token = user.generateAuthToken();
  await user.save();

  successResponse({
    res,
    data: {
      token,
      user: { id: user._id, name: user.name, email: user.email, roles: user.roles },
    },
    message: "Email verified successfully",
    statusCode: 200,
  });
});

const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
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
  // If the user is a Google user, they won't have a password set
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
  const code = req.body;

  if (!code) {
    errorResponse({
      res,
      message: "Authorization Code is required",
      statusCode: 400,
    });
    return;
  }

  let ticket;
  try {
    const { data } = await axios.post(
      "https://oauth2.googleapis.com/token",
      {
        code,
        client_id: config.google_client_id,
        client_secret: config.google_client_secret,
        redirect_uri: "postmessage", //  used when the code is returned directly to your frontend app (no redirect).
        grant_type: "authorization_code",
      },
      { headers: { "Content-Type": "application/json" } }
    );
    const idToken = data.id_token;
    if (!idToken) {
      errorResponse({
        res,
        message: "ID token not found in the response",
        statusCode: 400,
      });
      return;
    }
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
  const { email, name, picture } = payload;
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
      avatar: picture,
      email: email.toLowerCase(),
      isGoogleUser: true,
      isVerified: true,
    });
    await user.save();
  }

  const token = user.generateAuthToken();
  successResponse({
    res,
    data: {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        isAdmin: user?.roles?.includes("admin") || false,
      },
    },
    message: "User logged in successfully",
    statusCode: 200,
  });
});

export { registerNewUser, loginUser, googleLogin, verifyEmail };
