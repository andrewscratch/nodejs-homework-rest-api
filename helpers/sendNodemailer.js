const nodemailer = require("nodemailer");

const {META_PASSWORD} = process.env;

const sendNodemailer = async (data) => {
    const email = {...data, from: "andrew.chudlya@meta.ua"};
    const nodemailerConfig = {
        host: "smtp.meta.ua",
        port: 465,
        secure: true,
        auth: {
          user: "andrew.chudlya@meta.ua",
          pass: META_PASSWORD
        }
      };
      
      const transport = nodemailer.createTransport(nodemailerConfig);

    await transport.sendMail(email)
    .then(() => console.log("Email send"))
    .catch(error => console.log(error.message));

    return true;
}

module.exports = sendNodemailer;