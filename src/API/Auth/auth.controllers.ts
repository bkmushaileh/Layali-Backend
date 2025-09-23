import { NextFunction, Request, Response } from "express";

import validator from "validator";
import bcrypt from "bcrypt";
import { invalidCredentialsErrorHandler } from "../../Utils/errors";
import User from "../../Models/User";
import { generateHashPassword } from "../../Utils/hashPassword";
import { generatetoken } from "../../Utils/jwt";

export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body || {};
    const image = req.file ? req.file.path : null;

    if (!email || !password) {
      return next(
        invalidCredentialsErrorHandler("Email and password are required")
      );
    }
    if (!validator.isEmail(email)) {
      return next(invalidCredentialsErrorHandler("Invalid email format"));
    }
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return next({ status: 409, message: "Email already exists" });
    }
    const hashedPassword = await generateHashPassword(password);

    const newUser = await User.create({
      email,
      password: hashedPassword,
      image: image,
    });
    const token = generatetoken(newUser, email);

    return res.status(201).json({
      message: "Account created successfully",
      token,
      user: {
        _id: newUser._id,
        email: newUser.email,
        image: newUser.image,
      },
    });
  } catch (err) {
    console.error("signup error:", err);
    return next({ status: 500, message: "Something went wrong during signup" });
  }
};

export const signin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(
        invalidCredentialsErrorHandler("Email and password are required")
      );
    }
    const emailFound = await User.findOne({ email });
    if (!emailFound) {
      return next(invalidCredentialsErrorHandler());
    }
    const isMatch = await bcrypt.compare(password, emailFound.password!);
    if (!isMatch) {
      return next(invalidCredentialsErrorHandler());
    }
    const token = generatetoken(emailFound._id, email);
    return res.status(200).json({ message: "Signed in successfully", token });
  } catch (err) {
    console.error("signin error:", err);
    return next({ status: 500, message: "Something went wrong during signin" });
  }
};
