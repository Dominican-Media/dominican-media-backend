const { Users } = require("../models/Users");
const bcrypt = require("bcrypt");
const { uploadFile } = require("../helpers/uploadToCloudinary");

const handleCreateUser = async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone, role, gender, bio } =
      req.body;

    const { id } = req.user?.userId;
    const files = req.files;

    if (
      !email ||
      !password ||
      !firstName ||
      !lastName ||
      !phone ||
      !role ||
      !gender ||
      !bio
    ) {
      return res.status(400).json({ error: "All fields must be filled" });
    }

    const existingUser = await Users.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const userImageUpload = files?.image?.[0]
      ? await uploadFile(files.image[0].buffer, "users")
      : null;

    const [userImage] = await Promise.all([userImageUpload]);

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new Users({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone,
      role,
      createdBy: id,
      gender,
      image: userImage?.secure_url,
      bio,
    });

    await newUser.save();

    return res
      .status(201)
      .json({ message: "User profile created successfully", user: newUser });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ error: "There was an issue creating user account" });
  }
};

const handleToggleuserStatus = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "User Id is required" });
    }

    const user = await Users.findOne({ _id: id });

    if (!user) {
      return res.status(400).json({ error: "This user does not exist" });
    }

    const newUserStatus = user.status === "pending" ? "active" : "pending";

    user.status = newUserStatus;

    await user.save();

    return res
      .status(200)
      .json({ message: `User status set to ${newUserStatus}` });
  } catch (e) {
    return res
      .status(500)
      .json({ error: "There was an issue toggling this user's status" });
  }
};

const handleDeleteUserProfile = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(200).json({ error: "User id is requured" });
    }

    await Users.deleteOne({ _id: id });

    return res
      .status(200)
      .json({ message: "User account deleted successfully!" });

    // TODO: Delet users shows or write-ups
  } catch (err) {
    console.log(err);

    return res
      .status(500)
      .json({ error: "There was an issue deleting this user's account" });
  }
};

const handleUpdateUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, firstName, lastName, phone, role, gender, bio } = req.body;
    const files = req.files;

    if (!id) {
      return res.status(400).json({ error: "User id is required" });
    }

    const user = await Users.findOne({ _id: id });

    if (!user) {
      return res.status(400).json({ error: "This user does not exist" });
    }

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (role) user.role = role;
    if (gender) user.gender = gender;
    if (gender) user.gender = gender;
    if (bio) user.bio = bio;

    if (files) {
      const userImageUpload = files?.image?.[0]
        ? await uploadFile(files.image[0].buffer, "users")
        : null;

      const [userImage] = await Promise.all([userImageUpload]);

      if (userImage) user.image = userImage.secure_url;
    }

    await user.save();

    return res
      .status(200)
      .json({ message: "User account updated successfully!" });
  } catch (e) {
    console.log(e);

    return res
      .status(500)
      .json({ error: "There was an issue updating this user's account" });
  }
};

const handleGetUsers = async (req, res) => {
  const userId = req.user?.userId;

  try {
    const users = await Users.find();
    const filteredUsers = users?.filter((data) => String(data?._id) !== userId);

    return res.status(200).json({ users: filteredUsers });
  } catch (error) {
    console.log(err);

    return res.status(500).json({ error: "There was an issue fetching users" });
  }
};

const handleGetUserInfo = async (req, res) => {
  try {
    const userId = req.user?.userId;

    const user = await Users.findOne({ _id: userId });

    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    return res.status(200).json({ user });
  } catch (err) {
    console.log(err);

    return res
      .status(500)
      .json({ error: "There was an issue fetching user details" });
  }
};

const handleGetUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await Users.findOne({ _id: id });

    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    return res.status(200).json({ user });
  } catch (err) {
    console.log(err);

    return res
      .status(500)
      .json({ error: "There was an issue fetching user detail" });
  }
};

const handleGetUserStats = async (_, res) => {
  try {
    const users = await Users.find();

    const allUsers = users.length;
    const admins = users.filter((data) => data?.role === "admin")?.length;
    const authors = users.filter((data) => data?.role === "author")?.length;
    const presenters = users.filter(
      (data) => data?.role === "presenter"
    )?.length;

    return res.status(200).json({ allUsers, authors, admins, presenters });
  } catch (err) {
    console.log(err);

    return res
      .status(500)
      .json({ error: "There was an issue fetching user stats" });
  }
};

module.exports = {
  handleCreateUser,
  handleToggleuserStatus,
  handleDeleteUserProfile,
  handleUpdateUserProfile,
  handleGetUsers,
  handleGetUserInfo,
  handleGetUserById,
  handleGetUserStats,
};
