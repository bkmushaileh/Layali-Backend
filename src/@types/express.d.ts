import { EventDoc } from "../Models/Event";
import { UserDoc } from "../Models/User";

declare global {
  namespace Express {
    interface Request {
      user?: UserDoc;
    }
  }
}
declare global {
  namespace Express {
    interface Request {
      event?: EventDoc;
    }
  }
}
