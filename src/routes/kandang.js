var express = require("express");
var router = express.Router();
const kandangController = require("../controllers/kandangController");
const { upload } = require("../middlewares/multer");
const {
  authenticateToken,
  authenticateRefreshToken,
  checkBlacklist,
} = require("../middlewares/auth");

router.post(
  "/",
  authenticateToken,
  upload.array("images"),
  kandangController.createKandang
);

router.get("/", authenticateToken, kandangController.getAllKandangById);

router.get("/:id", authenticateToken, kandangController.getDetailKandang);

router.put(
  "/:id",
  authenticateToken,
  upload.array("images"),
  kandangController.updateKandang
);

router.delete("/:id", authenticateToken, kandangController.deleteKandang);

module.exports = router;
