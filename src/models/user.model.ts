import mongoose, { Schema, Document } from "mongoose";
import { IUserModel } from "../types/user.type";
import { comparePassword, hashPassword } from "../shared/hash";
import { generateAccessToken } from "../shared/tokens";

const cartItemSchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, default: 1 },
});
const userSchema = new Schema<IUserModel>(
  {
    avatar: { type: String, default: "https://res.cloudinary.com/dypwrrsyh/image/upload/v1749835815/3_i9epmg.png" },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    phone: { type: String },
    address: { type: String },
    roles: { type: [String], default: ["user"] },

    emailVerificationToken: { type: String, default: null },

    isVerified: { type: Boolean, default: false },
    isGoogleUser: { type: Boolean, default: false },

    cart: [cartItemSchema],
    wishlist: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    lastLogin: { type: Date },
    isActive: { type: Boolean, default: true },
    orderCount: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
  },
  { timestamps: true }
);

userSchema.pre<IUserModel>("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  this.password = await hashPassword(this.password);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return await comparePassword(candidatePassword, this.password);
};

userSchema.methods.generateAuthToken = function () {
  const token = generateAccessToken({
    _id: this._id,
    name: this.name,
    email: this.email,
    isAdmin: this.isAdmin,
    roles: this.roles,
  });
  return token;
};

const User = mongoose.model<IUserModel>("User", userSchema);
export default User;
