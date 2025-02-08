import { Request, Response } from "express";
import User from "../models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// 🔥 **Get User Profile (Protected Route)**
export const getUserProfile = async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized - No User Found" });
    }

    const user = await User.findById(req.user.id).select("-password"); // Exclude password field
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (error) {
    console.error("Profile Fetch Error:", error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

// Temporary OTP Store (For Verification Before Account Creation)
const otpStore: {
  [email: string]: {
    otp: string;
    expiresAt: number;
    userData?: {
      name: string;
      hashedPassword: string;
      role: string;
      profile_picture?: string;
    };
  };
} = {};

// 📩 Email Transporter Configuration
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// 🔥 **Register & Send OTP**
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role, profile_picture } = req.body;

    // 🛑 Check if User Already Exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // 🔒 Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 🎲 Generate OTP (6-digit)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[email] = {
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000, // Expires in 10 minutes
      userData: { name, hashedPassword, role, profile_picture },
    };

    // 📧 Send OTP via Email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP code is ${otp}. It expires in 10 minutes.`,
    });

    res.status(200).json({ message: "OTP sent to email" });
  } catch (error) {
    res.status(500).json({ message: "Error creating account", error });
  }
};

// ✅ **Verify OTP & Create User**
export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    if (!otpStore[email] || otpStore[email].expiresAt < Date.now()) {
      return res.status(400).json({ message: "OTP expired or invalid" });
    }

    if (otpStore[email].otp !== otp) {
      return res.status(400).json({ message: "Incorrect OTP" });
    }

    // 🎉 Create User After OTP Verification
    const { name, hashedPassword, role, profile_picture } =
      otpStore[email].userData!;
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
      profile_picture,
    });

    await newUser.save();
    delete otpStore[email]; // Cleanup OTP after successful verification

    res.status(200).json({ message: "Account created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error verifying OTP", error });
  }
};

// 🔥 **Login User**
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // ✅ Ensure both email and password are provided
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // 🔍 Find user in the database
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // 🔐 Validate Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // 🛡️ Generate JWT Token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profile_picture:
          user.profile_picture || "../voxhire/src/icons/default-profile.png",
      },
    });
  } catch (error) {
    console.error("Login Error:", error); // ✅ Print error in backend logs
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};
