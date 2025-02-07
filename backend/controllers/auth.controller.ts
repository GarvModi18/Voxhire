// controllers/auth.controller.ts
import { Request, Response } from "express";
import User from "../models/User";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// 🛠 Extended Type Definition ✅
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

// 📩 Email Transporter
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
