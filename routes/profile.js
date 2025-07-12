const express = require("express");
const {
  handleGetUsers,
  handleCreateUser,
  handleToggleuserStatus,
  handleUpdateUserProfile,
  handleDeleteUserProfile,
  handleGetUserInfo,
  handleGetUserById,
  handleGetUserStats,
} = require("../controllers/prodiles.controller");
const { verifyToken, isAdmin } = require("../middleware/auth");
const router = express.Router();
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get("/", verifyToken, isAdmin, handleGetUsers);

router.post(
  "/",
  verifyToken,
  isAdmin,
  upload.fields([{ name: "image", maxCount: 1 }]),
  handleCreateUser
);

router.patch(
  "/toggle-status/:id",
  verifyToken,
  isAdmin,
  handleToggleuserStatus
);

router.patch(
  "/:id",
  verifyToken,
  isAdmin,
  upload.fields([{ name: "image", maxCount: 1 }]),
  handleUpdateUserProfile
);

router.delete("/:id", verifyToken, isAdmin, handleDeleteUserProfile);

router.get("/me", verifyToken, handleGetUserInfo);

router.get("/:id", verifyToken, isAdmin, handleGetUserById);

router.get("/users/stats", verifyToken, isAdmin, handleGetUserStats);

module.exports = router;
