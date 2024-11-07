const express = require("express");
const router = express.Router();
const userDetailsController = require("../controllers/profileController");
const verifyToken = require("../middleware/verifyToken");
const upload = require('../middleware/upload');

router.get("/details", verifyToken, userDetailsController.getProfile);
router.post(
  "/create-profile",
  verifyToken,
  upload.single('image'),
  userDetailsController.updateProfile
);
router.get("/detailsbymail/:userEmail", userDetailsController.getProfilebymail);

module.exports = router;
