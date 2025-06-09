const { Users } = require("../models/Users");
const bcrypt = require("bcrypt");

const createUser = async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone, role, gender } =
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
      !gender
    ) {
      return res.status(400).json({ error: "ALl fields must be filled" });
    }

    const existingUser = Users.findOne({ email });

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
    });

    await newUser.save();

    return res
      .status(200)
      .json({ message: "User profile created successfully" });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ error: "There was an issue creating user account" });
  }
};

module.exports = { createUser };
