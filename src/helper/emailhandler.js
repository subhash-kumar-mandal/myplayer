require('dotenv/config');
const nodemailer = require('nodemailer');
const getOtpEmailHtml = require('./templete');

const { Resend } = require('resend')

const resend = new Resend(process.env.RESEND_API_KEY);

// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: process.env.GMAIL_USER,
//     pass: process.env.GMAIL_PASS
//   }
// });
// console.log("EMAIL HANDLER LOADED");

// transporter.verify((error, success) => {
//   if (error) {
//     console.error("SMTP VERIFY ERROR:", error);
//   } else {
//     console.log("SMTP SERVER READY:", success);
//   }
// });

// console.log("TRANSPORTER CREATED");

// const sendEmail = async (to, otp) => {
//   await transporter.sendMail({
//     from: `"Music Player" <${process.env.GMAIL_USER}>`,
//     to: to,
//     subject: 'Your Verification Code',
//     html: getOtpEmailHtml(otp)
//   })
// };



const sendEmail = async (to, otp) => {

  console.log("Sending OTP to:", to);

  const { data, error } = await resend.emails.send({
    from: "Music Player <onboarding@resend.dev>",
    to: [to],
    subject: "Your Verification Code",
    html: getOtpEmailHtml(otp)
  });

  // if (error) {
  //   console.error("RESEND ERROR:", error);
  //   throw new Error(error.message || "Email sending failed");
  // }

  // console.log("OTP email sent:", data);

  return data;
};




module.exports = sendEmail;