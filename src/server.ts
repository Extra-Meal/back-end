import { Request, Response } from "express";
import config from "./config/config";
import cors from "cors";
import connectDB from "./db";
const express = require("express");
const app = express();
const port = config.port;

const corsOptions: cors.CorsOptions = {
  origin: function (origin, callback) {
    // Allow any origin to access your server
    callback(null, true);
  },
  credentials: true, // Allow credentials (cookies) to be included
};
app.use(express.json());
app.use(cors(corsOptions));
app.get("/", (req: Request, res: Response) => res.send("Hello World!"));
app.listen(port, () => {
  connectDB();
  console.log(`Server is running in ${config.nodeEnv} mode`);
  console.log(`Example app listening on port ${port}!`);
});
