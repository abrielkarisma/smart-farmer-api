var express = require("express");
var router = express.Router();
const inventoryController = require("../controllers/inventoryController");
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
  inventoryController.createInventory
);

router.get(
  "/kandang/:id",
  authenticateToken,
  inventoryController.getInventoryByKandang
);

router.get(
  "/petugas",
  authenticateToken,
  inventoryController.getInventoryByPetugas
);

router.get(
  "/history/:id",
  authenticateToken,
  inventoryController.getHistoryInventory
);

// router.get("/", authenticateToken, kandangController.getAllKandangById);

router.get("/:id", authenticateToken, inventoryController.getDetailInventory);

router.put(
  "/:id",
  authenticateToken,
  upload.array("images"),
  inventoryController.updateInventory
);

router.delete("/:id", authenticateToken, inventoryController.deleteInventory);

module.exports = router;
