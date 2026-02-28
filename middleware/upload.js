const multer = require("multer");
const path = require("path");

function createStorage(folder) {
  return multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(__dirname, `../uploads/${folder}`));
    },
    filename: function (req, file, cb) {
      const uniqueName = Date.now() + "-" + file.originalname;
      cb(null, uniqueName);
    }
  });
}

exports.uploadAadhaar = multer({ storage: createStorage("aadhaar") });
exports.uploadPan = multer({ storage: createStorage("pan") });
exports.uploadBank = multer({ storage: createStorage("bank") });
exports.uploadPhoto = multer({ storage: createStorage("photo") });
exports.uploadSigned = multer({ storage: createStorage("signed") });