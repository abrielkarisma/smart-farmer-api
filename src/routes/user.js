var express = require('express');
var router = express.Router();
const userController = require("../controllers/userController");
const { upload } = require("../middlewares/multer");
const {
  authenticateToken,
  authenticateRefreshToken,
  checkBlacklist,
} = require("../middlewares/auth");

router.get("/", authenticateToken, userController.getDetailUser);

router.get("/petugas", authenticateToken, userController.getPetugasByOwner);

router.get("/petugas/:id", authenticateToken, userController.getDetailPetugas);

router.put("/petugas/:id", authenticateToken, userController.updatePetugas);

router.get("/kode", authenticateToken, userController.getKodeOwner);

module.exports = router;
