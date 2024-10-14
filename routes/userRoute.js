const express = require("express");
const router = express.Router();
const userDetailsController = require("../controllers/userDetailsController");
const verifyToken = require("../middleware/verifyToken");

router.get("/details", userDetailsController.getUsers);
router.post(
  "/create-profile",
  verifyToken,
  userDetailsController.createProfile
);

module.exports = router;
