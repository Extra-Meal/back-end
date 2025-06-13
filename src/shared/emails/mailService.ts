import nodemailer from "nodemailer";
import config from "../../config/config";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: config.nodemailer_email,
    pass: config.nodemailer_password,
  },
});

export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    const mailOptions = {
      from: `"Mealify" <${config.nodemailer_email}>`,
      to,
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};
