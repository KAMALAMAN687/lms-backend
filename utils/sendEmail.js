import nodemailer from "nodemailer";
import Mailgen from "mailgen";
//async await is not allowed in global scope, must use a wrapper

const sendEmail = async function (email, subject, message) {
  let config = {
    service: "gmail",
    auth: {
      user: process.env.username,
      pass: process.env.password,
    },
  };
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false, //true for 465, false for other ports
    service: "gmail",
    auth: {
      user: process.env.SMTP_USERNAME,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM_EMAIL, //sender address
    to: email, //user email
    subject: subject,
    html: message,
  });
};

export default sendEmail;
