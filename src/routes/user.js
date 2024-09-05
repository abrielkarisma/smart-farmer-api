var express = require('express');
var router = express.Router();
const userController = require("../controllers/userController");
const { upload } = require("../middlewares/multer");
const {
  authenticateToken,
  authenticateRefreshToken,
  checkBlacklist,
} = require("../middlewares/auth");

// router.get('/', authenticateToken, userController.getUsers);

module.exports = router;
