import { env } from "../Config/config";
import jwt from "jsonwebtoken";

export const generatetoken = (newUser: any, username: String) => {
  const payload = { _id: newUser._id, username };
  const secret = env.JWT_SECRET!;
  const options = { expiresIn: env.JWT_EXP } as jwt.SignOptions;
  const token = jwt.sign(payload, secret, options);
  return token;
};
