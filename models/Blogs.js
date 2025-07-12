const mongoose = require("mongoose");

const BlogsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: function () {
        return this.type === "published";
      },
    },
    description: {
      type: String,
      required: function () {
        return this.type === "published";
      },
    },
    category: {
      type: [mongoose.Schema.ObjectId],
      ref: "BlogCategory",
      required: function () {
        return this.type === "published";
      },
    },
    image: {
      type: String,
      required: false,
    },
    content: {
      type: String,
      required: function () {
        return this.type === "published";
      },
    },
    facebookUrl: { type: String },
    instagramUrl: { type: String },
    xUrl: { type: String },

    readCount: {
      type: Number,
      default: 0,
    },
    slug: {
      type: String,
      required: function () {
        return this.type === "published";
      },
      unique: true,
    },
    likeCount: {
      type: Number,
      default: 0,
    },
    type: {
      type: String,
      enum: ["published", "draft"],
      default: "published",
    },
    user: {
      type: [mongoose.Schema.ObjectId],
      ref: "Users",
      required: function () {
        return this.type === "published";
      },
    },
  },
  { timestamps: true }
);

const CategorySchema = mongoose.Schema({
  title: { type: String, required: false },
});

const BlogCommentSchema = mongoose.Schema({
  userName: { type: String, default: "Anonymous" },
  comment: { type: String, required: false },
  likeCount: { type: Number, default: 0 },
  slug: { type: String, required: true },
});

module.exports = {
  Blogs: mongoose.model("Blogs", BlogsSchema),
  BlogCategories: mongoose.model("BlogCategories", CategorySchema),
  BlogComment: mongoose.model("BlogComment", BlogCommentSchema),
};
