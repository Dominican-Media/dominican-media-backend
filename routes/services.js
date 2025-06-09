const express = require("express");
const {
  handleGetServices,
  handlePostServices,
  handleUpdateServices,
  handleGetServiceById,
  handleDeleteService,
} = require("../controllers/services.controller");
const { verifyToken, isAdmin } = require("../middleware/auth");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = express.Router();

router.get("/", verifyToken, isAdmin, handleGetServices);

router.get("/:id", verifyToken, isAdmin, handleGetServiceById);

router.post(
  "/",
  verifyToken,
  isAdmin,
  upload.fields([{ name: "image", maxCount: 1 }]),
  handlePostServices
);

router.patch(
  "/:id",
  verifyToken,
  isAdmin,
  upload.fields([{ name: "image", maxCount: 1 }]),
  handleUpdateServices
);

router.delete("/:id", verifyToken, isAdmin, handleDeleteService);

module.exports = router;
