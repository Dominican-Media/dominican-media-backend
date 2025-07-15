const express = require("express");
const {
  handleCreateBlogItem,
  handleGetBlogItems,
  handleUpdateBlogItem,
  handleDeleteBlogItem,
  handleCreateCategory,
  handleUpdateBlogLikeCount,
  handleCreateComment,
  handleGetCommentsBySlug,
  handleUpdateCommentLike,
  handleGetBlogBySlug,
  handleGetBlogCategories,
  handleDeleteBlogCategory,
  handleDeleteComment,
  handleToggleBlogItemType,
  handleUserGetBlogItems,
} = require("../controllers/blogs.controller");
const { verifyToken, isAuthor, isAdmin } = require("../middleware/auth");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = express.Router();

router.post(
  "/",
  verifyToken,
  isAuthor,
  upload.fields([{ name: "image", maxCount: 1 }]),
  handleCreateBlogItem
);

router.get("/", verifyToken, isAuthor, handleGetBlogItems);

router.get("/user", handleUserGetBlogItems);

router.get("/:slug", handleGetBlogBySlug);

router.patch(
  "/:slug",
  verifyToken,
  isAuthor,
  upload.fields([{ name: "image", maxCount: 1 }]),
  handleUpdateBlogItem
);

router.delete("/:slug", verifyToken, isAdmin, handleDeleteBlogItem);

router.post("/category/create", verifyToken, isAuthor, handleCreateCategory);

router.get("/category/get-categories", handleGetBlogCategories);

router.delete("/category/:id", verifyToken, isAuthor, handleDeleteBlogCategory);

router.patch("/like/:slug", handleUpdateBlogLikeCount);

router.post("/comments/:slug", handleCreateComment);

router.get("/comments/:slug", handleGetCommentsBySlug);

router.delete("/comments/delete/:commentId", handleDeleteComment);

router.patch("/comments/:commentId", handleUpdateCommentLike);

router.patch(
  "/type/toggle/:slug",
  verifyToken,
  isAuthor,
  handleToggleBlogItemType
);

module.exports = router;
