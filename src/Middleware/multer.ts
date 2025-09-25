import multer from "multer";
import fs from "fs";
import path from "path";

const uploadDir = path.join(__dirname, "../../uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const cleanName = file.originalname.replace(/\s+/g, "");

    cb(null, `${file.fieldname}-${uniqueSuffix}-${cleanName}`);
  },
});

const upload = multer({ storage });
export default upload;
