import transporter from "../configs/email.config.js";
import dotEnv from "dotenv";

dotEnv.config();

const sendEmail = async ({
  to, // string or array
  subject,
  name,
  cc, // string or array,
  bcc, // string or array
  text, // plain text body
  html, // html body
  attachment, // array of objects
}) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
    html,
  };

  return transporter.sendMail(mailOptions);
};

export { sendEmail };
