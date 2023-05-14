const sgMail = require("@sendgrid/mail");

const {SENDGRID_API_KEY, BASE_URL} = process.env;

sgMail.setApiKey(SENDGRID_API_KEY);

const sendEmail = async (email, verificationCode) => {
    const newEmail = {
        to: email,
        subject: "Verify email",
        html: `<a target="_blank" href="${BASE_URL}/api/users/verify/${verificationCode}">Click verify email</a>`,
        from: "andrewww@ua.fm"};

    await sgMail.send(newEmail)
    .then(() => console.log("Email send"))
    .catch(error => console.log(error.message));

    return true;
}

module.exports = sendEmail;
