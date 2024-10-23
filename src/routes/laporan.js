var express = require("express");
var router = express.Router();
const laporanKematianController = require("../controllers/laporanKematianAyamController");
const laporanPanenTelurController = require("../controllers/laporanPanenTelurController");
const laporanAyamPedagingController = require("../controllers/laporanAyamPedagingController");
const laporanController = require("../controllers/laporanController");
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

router.post(
  "/panen-telur",
  authenticateToken,
  laporanPanenTelurController.createLaporanPanenTelur
);

router.get(
  "/panen-telur/:id",
  authenticateToken,
  laporanPanenTelurController.getDetailLaporanPanenTelur
);

router.put(
  "/panen-telur/:id",
  authenticateToken,
  laporanPanenTelurController.updateStatusLaporanPanenTelur
);

router.post(
  "/ayam-pedaging/sampling",
  authenticateToken,
  upload.array("images"),
  laporanAyamPedagingController.createLaporanAyamPedagingSampling
);

router.get(
  "/ayam-pedaging/sampling/:id",
  authenticateToken,
  laporanAyamPedagingController.getDetailLaporanPanenAyamPedagingSampling
);

router.put(
  "/ayam-pedaging/:id",
  authenticateToken,
  laporanAyamPedagingController.updateStatusLaporanPanenAyamPedaging
);

router.get("/", authenticateToken, laporanController.getAllLaporanByUser);

router.get("/owner/all", authenticateToken, laporanController.getAllLaporanByOwner);
router.get("/petugas/all", authenticateToken, laporanController.getAllLaporanByPetugas);
router.get("/:id", authenticateToken, laporanController.getDetailLaporan);

router.get("/statistic/:id", authenticateToken, laporanController.getStatisticByKandang);

module.exports = router;