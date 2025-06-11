import mongoose, { Schema, Document } from "mongoose";
import { IUserModel } from "../types/user.type";
import { hashPassword } from "../shared/hash";
import jwt from "jsonwebtoken";
import config from "../config/config";

const userSchema = new Schema<IUserModel>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String },
    address: { type: String },

    roles: { type: [String], default: ["user"] },
    isVerified: { type: Boolean, default: false },

    cart: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    wishlist: [{ type: Schema.Types.ObjectId, ref: "Product" }],
  },
  { timestamps: true }
);

userSchema.pre<IUserModel>("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await hashPassword(this.password);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  const isMatch = (await hashPassword(candidatePassword)) === this.password;
  return isMatch;
};

userSchema.methods.generateAuthToken = function () {
  if (!config.jwt_secret) {
    throw new Error("JWT_SECRET is not defined");
  }
  console.log(this);
  const token = jwt.sign(
    { id: this._id, name: this.name, email: this.email, isAdmin: this.isAdmin },
    config.jwt_secret,
    { expiresIn: "3d" }
  );
  return token;
};

const User = mongoose.model<IUserModel>("User", userSchema);
export default User;
