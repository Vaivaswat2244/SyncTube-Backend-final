const express = require("express");
const router = express.Router();
const userDetailsController = require("../controllers/userDetailsController");

router.get("/users", userDetailsController.getUsers);

module.exports = router;
