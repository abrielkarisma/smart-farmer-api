var express = require("express");
var router = express.Router();
const laporanKematianController = require("../controllers/laporanKematianAyamController");
const { upload } = require("../middlewares/multer");
const {
  authenticateToken,
  authenticateRefreshToken,
  checkBlacklist,
} = require("../middlewares/auth");

router.post(
  "/kematian-ayam",
  authenticateToken,
  laporanKematianController.createLaporanKematianAyam
);

router.get(
  "/kematian-ayam/:id",
  authenticateToken,
  laporanKematianController.getDetailLaporanKematianAyam
);

router.put(
  "/kematian-ayam/:id",
  authenticateToken,
  laporanKematianController.updateStatusLaporanKematianAyam
);

module.exports = router;