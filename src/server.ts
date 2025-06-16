import express, { Request, Response } from "express";
import cors from "cors";
import config from "./config/config";
import connectDB from "./db";

import AuthRouter from "./routes/auth.route";
import AreaRouter from "./routes/area.route";
import CategoryRouter from "./routes/categories.route";
import UserRouter from "./routes/user.route";
import CartRouter from "./routes/cart.route";
import WishlistRouter from "./routes/wishList.route";
import { errorResponse } from "./shared/response";

const app = express();

const port = config.port;

const corsOptions: cors.CorsOptions = {
  origin: function (origin, callback) {
    callback(null, true);
  },
  credentials: true,
};

app.use(express.json());
app.use(cors(corsOptions));

app.use("/api/auth", AuthRouter);
app.use("/api/areas", AreaRouter);
app.use("/api/category", CategoryRouter);
app.use("/api/users", UserRouter);
app.use("/api/cart", CartRouter);
app.use("/api/wishlist", WishlistRouter);

// Health check route
app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

// Handle 404 errors
app.get("*", (req: Request, res: Response) => {
  errorResponse({
    res,
    message: "Route not found",
    statusCode: 404,
  })
});

app.listen(port, () => {
  connectDB();
  console.log(`Server is running in ${config.nodeEnv} mode`);
  console.log(`Example app listening on port ${port}!`);
});
