'use strict';
const nodemailer = require('nodemailer');
const defaultFrom = '"Personal Page" <noreply@personal-page.com>';

class EmailService {
  async sendRegistrationMail(user) {
    return this._send({
      to: user.email,
      subject: 'Personal Page Developer - Registration',
      text: `Dear ${user.first_name}!\n\nYou have successfully registered on our developer site!\n.`,
      html: `<p>Dear <b>${user.first_name}</b>!</p><br><p>You have successfully registered on our developer site!</p>`,
    });
  }
  async _send(mail){
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        secure: false, // true for 465, false for other ports
      });
      mail.html = `<html><head></head><body>${mail.html}</body></html>`
      return transporter.sendMail({
        from: defaultFrom,
        ...mail
      });
    } catch (e) {
      console.log(e);
      return null;
    }
  }
}

module.exports = new EmailService();
