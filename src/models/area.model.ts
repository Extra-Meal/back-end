import mongoose, { Schema } from "mongoose";
import { IAreaModel } from "../types/area.type";

const areaSchema = new Schema<IAreaModel>(
  {
    name: { type: String, required: true, unique: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Area = mongoose.model<IAreaModel>("Area", areaSchema);
export default Area;
