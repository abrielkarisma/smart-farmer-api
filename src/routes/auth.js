var express = require("express");
var router = express.Router();
const userController = require("../controllers/userController");
const cors = require("cors");
const {
  authenticateToken,
  authenticateRefreshToken,
  checkBlacklist,
} = require("../middlewares/auth");
router.use(cors());

router.post("/signup", userController.signUp);
router.post("/signin", userController.signIn);

router.post("/petugas/signup", userController.signUpPetugas);


module.exports = router;