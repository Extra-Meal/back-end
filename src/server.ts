import express from "express";
import cors from "cors";
import config from "./config/config";
import connectDB from "./db";

import AuthRouter from "./routes/auth.route";
import AreaRouter from "./routes/area.route";
import CategoryRouter from "./routes/categories.route";

const app = express();
type Request = express.Request;
type Response = express.Response;

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
app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  connectDB();
  console.log(`Server is running in ${config.nodeEnv} mode`);
  console.log(`Example app listening on port ${port}!`);
});
