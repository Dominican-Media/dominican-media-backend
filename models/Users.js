const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: { type: String, required: true },
    role: {
      type: String,
      default: "user",
      enum: ["admin", "presenter", "author"],
    },
    status: { type: String, default: "active" },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      default: null,
    },
    image: { type: String, isRequired: false, default: null },
    gender: { type: String, required: false, default: "none" },
    resetPasswordToken: { type: String, required: false },
    resetPasswordExpires: { type: String, required: false },
  },
  { timestamps: true }
);

module.exports = {
  Users: mongoose.model("Users", UserSchema),
};
