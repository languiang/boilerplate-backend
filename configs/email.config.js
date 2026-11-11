import nodemailer from "nodemailer";
import dotEnv from "dotenv";

dotEnv.config();

const transportConfig = {
  host: "smtp.gmail.com",
  port: 587,
  tls: {
    ciphers: "SSLv3",
  },
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
};

const transporter = nodemailer.createTransport(transportConfig);

export default transporter;
