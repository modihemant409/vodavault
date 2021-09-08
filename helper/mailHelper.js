const sgMail = require("@sendgrid/mail");
const config = require("config");
// const nodemailer = require("nodemailer");
// const transport = nodemailer.createTransport({
//   service: "SendGrid",
//   auth: {
//     user: "hemantmodi@gmail.com",
//     pass: "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",
//   },
//   port: 587,
//   host: "smtp.sendgrid.net",
// });
sgMail.setApiKey(config.get("Email.password"));
async function sendEmail(to, from, subject, data) {
  console.log(to);
  const msg = {
    to: to, // Change to your recipient
    from: config.get("Email.username"), // Change to your verified sender
    subject: subject,
    html: data,
  };
  try {
    sgMail.send(msg);
  } catch (error) {
    console.log(err);
    throw error;
  }

  // try {
  //   transport.sendMail({
  //     to: to,
  //     from: from,
  //     subject: subject,
  //     html: data,
  //   });
  //   return "sent successfull";
  // } catch (err) {
  //   throw err;
  // }
}
exports.sendEmail = sendEmail;
