{
  /*This is reusable global error handler 🌏*/
}
import { Request, Response, NextFunction } from "express";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("🔥 Error caught by middleware:", err);
  return res.status(err.status || 500).json({
    message: err.message || "Something went wrong. Please try again later.",
  });
};
