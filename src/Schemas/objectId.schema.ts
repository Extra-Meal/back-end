import { z } from "zod";

const objectIdRegex = /^[a-f\d]{24}$/i;
export const ObjectIdSchema = z.string().regex(objectIdRegex, {
  message: "Invalid ObjectId",
});
