const userModel = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

async function registerUser(req, res) {
  try {
    const { fullName: { firstName, lastName }, email, password } = req.body;
    const isUserAlreadyExists = await userModel.findOne({ email });

    if (isUserAlreadyExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hasPassword = await bcrypt.hash(password, 10);
    const user = await userModel.create({
      fullName: { firstName, lastName },
      email,
      password: hasPassword,
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.cookie("token", token, { httpOnly: true, sameSite: "lax" });

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        email: user.email,
        _id: user._id,
        fullName: user.fullName,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Registration failed: " + error.message });
  }
}

async function loginUser(req, res) {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.cookie("token", token, { httpOnly: true, sameSite: "lax" });

    res.status(200).json({
      message: "User logged in successfully",
      token,
      user: {
        email: user.email,
        _id: user._id,
        fullName: user.fullName,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed: " + error.message });
  }
}

async function getProfile(req, res) {
  try {
    const user = req.user;
    res.status(200).json({
      user: {
        email: user.email,
        _id: user._id,
        fullName: user.fullName,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to get profile" });
  }
}

async function logoutUser(req, res) {
  res.clearCookie("token");
  res.status(200).json({ message: "Logged out successfully" });
}

module.exports = { registerUser, loginUser, getProfile, logoutUser };
