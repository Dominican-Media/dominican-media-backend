const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Users } = require("../models/Users");

const signUp = async (req, res) => {
  const {
    email,
    password,
    firstName,
    lastName,
    phone,
    role,
    createdBy,
    gender,
  } = req.body;

  try {
    if (
      !email ||
      !password ||
      !firstName ||
      !lastName ||
      !phone ||
      !role ||
      !gender
    ) {
      return res.status(400).json({ error: "All fields must be filled" });
    }

    const existingUser = await Users.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new Users({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone,
      role,
      createdBy,
      gender,
    });

    newUser.save();

    res.json({
      message: "Account created successfully",
    });
  } catch (err) {
    console.log(`Error creating account: ${err}`);
    res.status(500).json({ error: `There was an error creating your account` });
  }
};

const signIn = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await Users.findOne({ email });

    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.status !== "active") {
      return res.status(401).json({ error: "Account is not active" });
    }

    const isMatch = await bcrypt.compare(password, user?.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    if (user.firstLogin) {
      return res.status(403).json({ message: "Please Reset your password" });
    }

    const token = jwt.sign(
      { userId: user?._id, role: user.role },
      process.env.JWT_SECRET_KEY
    );

    res.json({
      token,
      user: user,
    });
  } catch (err) {
    console.log(`Error logging-in to account: ${err}`);
    res
      .status(500)
      .json({ error: `There was an error logging-in to your account` });
  }
};

module.exports = { signUp, signIn };
