import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

export const sendEmails = async (invitations: any[]) => {
  for (const invitation of invitations) {
    const { email, date, time, post } = invitation;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Voxhire Interview Invitation",
      html: `
        <p>Dear Candidate,</p>
        <p>You have been invited to an interview for the position of <b>${post}</b>.</p>
        <p><b>Date:</b> ${date}</p>
        <p><b>Time:</b> ${time}</p>
        <br>
        <p>If you have any questions, please contact at ${process.env.EMAIL_USER}.</p>
        <p>Best Regards,<br>Voxhire Team</p>
      `,
    };

    await transporter.sendMail(mailOptions);
  }
};
