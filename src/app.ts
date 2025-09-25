import express from "express";
import { env } from "./Config/config";
import connectDB from "./Config/database";
import cors from "cors";
import morgan from "morgan";
import { errorHandler } from "./Middleware/errorHandler";
import path from "path";
import { notFound } from "./Middleware/notFound";
import authRouter from "./API/Auth/auth.routers";
import vendorRouter from "./API/Vendor/vendor.routers";

connectDB();

const app = express();
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use(cors());
app.use(morgan("dev"));
// app.use(express.urlencoded({ extended: true })); // <-- for form data

app.use("/api/auth", authRouter);
app.use("/api/vendor", vendorRouter);

app.use(errorHandler);
app.use(notFound);

app.listen(env.PORT, () => {
  console.log(`Server is running on port ${env.PORT}`);
});
