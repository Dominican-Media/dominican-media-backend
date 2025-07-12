const { uploadFile } = require("../helpers/uploadToCloudinary");
const { Blogs, BlogCategories, BlogComment } = require("../models/Blogs");
const slugify = require("slugify");
const { Users } = require("../models/Users");

const handleCreateBlogItem = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      content,
      facebookUrl,
      instagramUrl,
      xUrl,
      type,
    } = req.body;
    const userId = req.user?.userId;

    const files = req.files;

    if (
      (!title || !description || !category?.length || !content) &&
      type === "published"
    ) {
      return res
        .status(400)
        .json({ error: "All important fields must be filled" });
    }

    let baseSlug = slugify(title, { lower: true, strict: true });
    let slug = baseSlug;
    let counter = 1;
    while (await Blogs.findOne({ slug })) {
      slug = `${baseSlug}-${counter++}`;
    }

    let categoryArray = category;

    if (typeof category === "string") {
      try {
        categoryArray = JSON.parse(category);
      } catch (err) {
        return res.status(400).json({
          error:
            "Invalid category format. Must be an array or JSON string array.",
        });
      }
    }

    const existingCategories = await BlogCategories.find({
      _id: { $in: categoryArray },
    });

    if (existingCategories.length !== categoryArray.length) {
      return res
        .status(400)
        .json({ error: "One or more category IDs are invalid." });
    }

    // Upload image
    const blogImageUpload = files?.image?.[0]
      ? await uploadFile(files.image[0].buffer, "blog")
      : null;

    const [blogImage] = await Promise.all([blogImageUpload]);

    // Extract URL or secure_url
    const imageUrl = blogImage?.secure_url || blogImage?.url || null;

    // Save blog
    const blogItem = new Blogs({
      title,
      slug,
      description,
      category: categoryArray,
      content,
      facebookUrl,
      instagramUrl,
      xUrl,
      image: imageUrl,
      type,
      user: userId,
    });

    await blogItem.save();

    return res
      .status(201)
      .json({ message: `${title || "Blog Item"} uploaded successfully.` });
  } catch (error) {
    console.error("Error creating blog:", error);
    return res
      .status(500)
      .json({ error: "There was an error uploading this new blog item." });
  }
};

const handleGetBlogItems = async (req, res) => {
  try {
    const { search = "", type } = req.query;
    const userId = req.user?.userId;

    const user = await Users.findById(userId);

    console.log(user, "Check", userId);

    // Build a query object
    const query = {};

    if (user?.role !== "admin") {
      query.user = user?._id;
    }

    if (type === "published" || type === "draft") {
      query.type = type;
    }

    if (search.trim() !== "") {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const blogs = await Blogs.find(query).sort({ createdAt: -1 });

    res.status(200).json({ blogs });
  } catch (error) {
    console.error("Error fetching blogs:", error);
    res.status(500).json({ error: "There was an error retrieving blogs" });
  }
};

const handleGetBlogBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    if (!slug) {
      return res.status(400).json({ error: "There was no slug found" });
    }

    const blogItem = await Blogs.findOne({ slug });

    if (!blogItem) {
      return res
        .status(400)
        .json({ error: "No blog item with this slug exists" });
    }

    return res.status(200).json({ blogItem });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: `There was an error retrieving blog item`,
    });
  }
};

const handleUpdateBlogItem = async (req, res) => {
  try {
    const { slug } = req.params;
    const {
      title,
      description,
      category,
      content,
      facebookUrl,
      instagramUrl,
      xUrl,
    } = req.body;
    const files = req.files;

    if (!slug) {
      return res.status(400).json({ error: "There was no slug found" });
    }

    const blogItem = await Blogs.findOne({ slug });

    if (!blogItem) {
      return res
        .status(400)
        .json({ error: "No blog item with this slug exists" });
    }

    if (files?.image) {
      const blogImageUpload = files?.image?.[0]
        ? await uploadFile(files.image[0].buffer, "blog")
        : null;

      const [blogImage] = await Promise.all([blogImageUpload]);

      blogItem.image = blogImage?.secure_url;
    }

    if (category) {
      let categoryArray = category;

      if (typeof category === "string") {
        try {
          categoryArray = JSON.parse(category);
        } catch (err) {
          return res.status(400).json({
            error:
              "Invalid category format. Must be an array or JSON string array.",
          });
        }
      }

      blogItem.category = categoryArray;
    }

    if (title) blogItem.title = title;
    if (description) blogItem.description = description;
    if (content) blogItem.content = content;
    if (facebookUrl) blogItem.facebookUrl = facebookUrl;
    if (instagramUrl) blogItem.instagramUrl = instagramUrl;
    if (xUrl) blogItem.xUrl = xUrl;

    await blogItem.save();

    return res.status(200).json({ message: `Blog item updated successfully` });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: `There was an error updating this blog item`,
    });
  }
};

const handleDeleteBlogItem = async (req, res) => {
  try {
    const { slug } = req.params;

    if (!slug) {
      return res.status(400).json({ error: "Slug parameter is required." });
    }

    const blog = await Blogs.findOne({ slug });

    if (!blog) {
      return res.status(404).json({ error: "Blog item not found." });
    }

    await Blogs.deleteOne({ slug });

    return res
      .status(200)
      .json({ message: `Blog item '${slug}' deleted successfully.` });
  } catch (error) {
    console.error("Error deleting blog item:", error);
    return res
      .status(500)
      .json({ error: "Failed to delete blog item. Please try again later." });
  }
};

const handleCreateCategory = async (req, res) => {
  try {
    const { title } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({ error: "Blog category must have a title" });
    }

    const category = await BlogCategories.findOne({ title });

    if (category) {
      return res.status(400).json({ error: "Blog category already exists" });
    }

    const newCategory = new BlogCategories({ title });

    await newCategory.save();

    return res
      .status(200)
      .json({ message: `New category ${title} created successfully` });
  } catch (error) {
    return res.status(500).json({ error: "Failed to create blog category" });
  }
};

const handleGetBlogCategories = async (req, res) => {
  try {
    const categories = await BlogCategories.find();

    return res.status(200).json({ categories });
  } catch (error) {
    return res.status(500).json({ error: "Failed to get blog categories" });
  }
};

const handleDeleteBlogCategory = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res
        .status(400)
        .json({ error: "Category Id parameter is required." });
    }

    const category = await BlogCategories.findOne({ _id: id });

    if (!category) {
      return res.status(404).json({ error: "Blog category not found." });
    }

    await BlogCategories.deleteOne({ _id: id });

    return res.status(200).json({
      message: `Blog categpry '${category?.title}' deleted successfully.`,
    });
  } catch (error) {
    console.error("Error deleting blog categpry:", error);
    return res.status(500).json({
      error: "Failed to delete blog category. Please try again later.",
    });
  }
};

const handleUpdateBlogLikeCount = async (req, res) => {
  try {
    const { slug } = req.params;
    const { action } = req.body;

    if (!slug) {
      return res.status(400).json({ error: "There was no slug found" });
    }

    if (!["like", "unlike"].includes(action)) {
      return res
        .status(400)
        .json({ error: "Action must be either like or unlike" });
    }

    const blogItem = await Blogs.findOne({ slug });

    if (!blogItem) {
      return res
        .status(400)
        .json({ error: "No blog item with this slug exists" });
    }

    if (action === "like") {
      blogItem.likeCount = blogItem.likeCount + 1;
    } else if (action === "unlike") {
      blogItem.likeCount = blogItem.likeCount - 1;
    }

    await blogItem.save();

    return res.status(200).json({ message: "Like count updated successfully" });
  } catch (error) {
    console.error("Error deleting blog categpry:", error);
    return res.status(500).json({
      error: `There was an issue liking this blog item, please try again`,
    });
  }
};

const handleCreateComment = async (req, res) => {
  try {
    const { userName, comment } = req.body;
    const { slug } = req.params;

    if (!comment || !slug || !userName) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const existingComments = await BlogComment.find({ userName, slug });

    if (existingComments.length >= 2) {
      return res
        .status(403)
        .json({ error: "User has already commented twice on this blog." });
    }

    const newComment = new BlogComment({
      userName,
      comment,
      slug,
    });

    await newComment.save();

    return res
      .status(201)
      .json({ message: "Comment added successfully", comment: newComment });
  } catch (error) {
    console.error("Create comment error:", error);
    return res.status(500).json({ error: "Failed to add comment" });
  }
};

const handleGetCommentsBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    if (!slug) {
      return res.status(400).json({ error: "Slug is required" });
    }

    const comments = await BlogComment.find({ slug }).sort({ createdAt: -1 });

    return res.status(200).json(comments);
  } catch (error) {
    console.error("Get comments error:", error);
    return res.status(500).json({ error: "Failed to fetch comments" });
  }
};

const handleDeleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    const deleted = await BlogComment.findByIdAndDelete(commentId);

    if (!deleted) {
      return res.status(404).json({ error: "Comment not found" });
    }

    return res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Delete comment error:", error);
    return res.status(500).json({ error: "Failed to delete comment" });
  }
};

const handleUpdateCommentLike = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { action } = req.body;

    if (!["like", "unlike"].includes(action)) {
      return res
        .status(400)
        .json({ error: "Action must be either 'like' or 'unlike'" });
    }

    const comment = await BlogComment.findById(commentId);

    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    if (action === "like") {
      comment.likeCount += 1;
    } else if (action === "unlike" && comment.likeCount > 0) {
      comment.likeCount -= 1;
    }

    await comment.save();

    return res
      .status(200)
      .json({ message: "Like count updated", likeCount: comment.likeCount });
  } catch (error) {
    console.error("Update like error:", error);
    return res.status(500).json({ error: "Failed to update like count" });
  }
};

const handleToggleBlogItemType = async (req, res) => {
  try {
    const { slug } = req.params;
    const userId = req.userId;

    if (!slug) {
      return res.status(400).json({ error: "No slug or blog Id supplied" });
    }

    const blogItem = await Blogs.findOne({ slug });
    if (!blogItem) {
      return res
        .status(400)
        .json({ error: "No blog item with this Id was found" });
    }

    const newType = blogItem.type === "published" ? "draft" : "published";

    await Blogs.findOneAndUpdate(
      { slug },
      { type: newType },
      { new: true, runValidators: false }
    );

    return res
      .status(200)
      .json({ message: `Blog status has been changed to ${newType}` });
  } catch (error) {
    console.error("Update blog type error:", error);
    return res
      .status(500)
      .json({ error: "There was an error changing blog item status" });
  }
};

module.exports = {
  handleCreateBlogItem,
  handleGetBlogItems,
  handleGetBlogBySlug,
  handleUpdateBlogItem,
  handleDeleteBlogItem,
  handleCreateCategory,
  handleDeleteBlogCategory,
  handleUpdateBlogLikeCount,
  handleCreateComment,
  handleGetCommentsBySlug,
  handleDeleteComment,
  handleUpdateCommentLike,
  handleGetBlogCategories,
  handleToggleBlogItemType,
};
