require('dotenv/config');
const nodemailer = require('nodemailer');
const getOtpEmailHtml = require('./templete');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
});

transporter.verify((error, success) => {
  if (error) {
    console.error("SMTP VERIFY ERROR:", error);
  } else {
    console.log("SMTP SERVER READY:", success);
  }
});



const sendEmail = async (to, otp) => {
  await transporter.sendMail({
    from: `"Music Player" <${process.env.GMAIL_USER}>`,
    to: to,
    subject: 'Your Verification Code',
    html: getOtpEmailHtml(otp)
  })
};





module.exports = sendEmail;