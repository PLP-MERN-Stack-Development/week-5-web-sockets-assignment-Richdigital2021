const express = require("express");

const router = express.Router();
const {
  registerUser,
  loginUser,
  getUsers,
  updateUserStatus,
} = require("../controllers/authController");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/users", getUsers);
router.put("/users/:id/status", updateUserStatus);

module.exports = router;
// This code defines the routes for user authentication in a chat application.
// It uses Express.js to create a router that handles user registration, login, fetching users, and updating user status.
