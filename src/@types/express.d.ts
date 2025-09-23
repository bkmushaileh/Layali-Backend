import { UserDoc } from "../Models/User";

declare global {
  namespace Express {
    interface Request {
      user?: UserDoc;
    }
  }
}
