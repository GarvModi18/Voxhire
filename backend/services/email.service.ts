import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  // Voxhire email and password
});

export const sendEmails = async (invitations: any[]) => {
  for (const invitation of invitations) {
    const { email, interviewSessionId, allocated_time } = invitation;
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Voxhire Interview Invitation",
      text: `You are invited to attend the interview session scheduled for ${allocated_time}. 
              Click to join your interview: https://voxhire.com/interview/${interviewSessionId}?token=${invitation.token}`,
    };
    await transporter.sendMail(mailOptions);
  }
};
