import { Request, Response } from "express";
import User from "../models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import cloudinary from "../config/cloudinary";
import Candidate from "../models/Candidate";

dotenv.config();

// 📩 Email Configuration
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

// ✅ Temporary OTP Store
const otpStore: {
  [email: string]: { otp: string; expiresAt: number; userData?: any };
} = {};

// 🔥 **Register & Send OTP**
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    otpStore[email] = {
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000,
      userData: { name, hashedPassword, role },
    };

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP",
      text: `Your OTP is ${otp}.`,
    });

    res.status(200).json({ message: "OTP sent to email" });
  } catch (error) {
    res.status(500).json({ message: "Error registering", error });
  }
};

// ✅ **Verify OTP & Create User**
export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;
    if (!otpStore[email] || otpStore[email].expiresAt < Date.now())
      return res.status(400).json({ message: "OTP expired or invalid" });
    if (otpStore[email].otp !== otp)
      return res.status(400).json({ message: "Incorrect OTP" });

    const { name, hashedPassword, role } = otpStore[email].userData!;
    const newUser = new User({ name, email, password: hashedPassword, role });
    await newUser.save();

    if (role === "Candidate") {
      const newCandidate = new Candidate({
        user_id: newUser._id, // Associate the candidate with the user
        interview_sessions: [], // Initialize with empty array
      });
      await newCandidate.save();
    }
    delete otpStore[email];

    res.status(200).json({ message: "Account created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error verifying OTP", error });
  }
};

// ✅ **Login User**
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(400).json({ message: "Invalid credentials" });

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
        profile_picture: user.profile_picture || "",
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error });
  }
};
interface CustomRequest extends Request {
  file?: Express.Multer.File;
}
// ✅ Upload Profile Picture & Update MongoDB
export const uploadProfilePic = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "❌ No file uploaded." });
    }

    // ✅ Upload Image to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "profile_pictures",
      resource_type: "image",
    });

    // ✅ Update MongoDB with new Cloudinary URL
    const updatedUser = await User.findByIdAndUpdate(
      req.user!.id,
      { profile_picture: result.secure_url },
      { new: true } // ✅ Return updated user
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "❌ User not found." });
    }

    res.json({ profilePic: updatedUser.profile_picture });
  } catch (error) {
    res.status(500).json({
      message: "❌ Profile picture upload failed.",
      error: error.message,
    });
  }
};
// ✅ **Get Profile**
export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user!.id).select("-password");
    console.log("👤 User Profile:", user);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Error fetching profile", error });
  }
};
