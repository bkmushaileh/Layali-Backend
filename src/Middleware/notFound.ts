import { NextFunction, Request, Response } from "express";

export const notFound = (req: Request, res: Response, next: NextFunction) => {
  return next({ status: 404, message: "Oops! This path does not exist 🚧" });
};
