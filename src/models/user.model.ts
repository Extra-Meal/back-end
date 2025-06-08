import mongoose, { Schema, Document } from "mongoose";
import { IUser } from "../types/user.type";
import { hashPassword } from "../shared/hash";

const userSchema = new Schema<IUser>(
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

userSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await hashPassword(this.password);
  next();
});

const User = mongoose.model<IUser>("User", userSchema);
export default User;
