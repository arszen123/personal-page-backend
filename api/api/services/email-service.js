'use strict';
const nodemailer = require('nodemailer');
const defaultFrom = '"Personal Page" <noreply@personal-page.com>';
const subjectPrefix = 'Personal Page - ';

class EmailService {
  async sendRegistrationMail(user) {
      return this._send({
        to: user.email,
        subject: 'Registration',
        text: `Dear ${user.first_name}!\n\nYou have successfully registered!\nUpload your data, and create your personal page.`,
        html: `<p>Dear <b>${user.first_name}</b>!</p><br><p>You have successfully registered!</p><p>Upload your data, and create your personal page now.</p>`,
      });
  }

  async sendEmailChangeMail(user) {
    return this._send({
      to: user.email,
      subject: 'Email change',
      text: `Dear ${user.first_name}!\n\nYou have successfully changed yor email address!.`,
      html: `<p>Dear <b>${user.first_name}</b>!</p><br><p>You have successfully changed yor email address</p>`,
    });
  }

  async sendDeleteRequestMail(user, deleteUrl) {
      return this._send({
        to: user.email,
        subject: 'Account delete request',
        text: `Dear ${user.first_name}!\n\nYou can delete your account by opening the following url in the browser: ${deleteUrl}.\nYou can use the above url for 24 hours.`,
        html: `<p>Dear <b>${user.first_name}</b>!</p><br><p>You can delete your account <a href="${deleteUrl}">here</a></p><p>Or by opening the following url in the browser: ${deleteUrl}</p><p>You can use the above url for 24 hours.</p>`,
      });
  }

  async sendDeletedMail(user) {
      return this._send({
        to: user.email,
        subject: 'Account deleted successfully',
        text: `Dear ${user.first_name}!\n\nYou have successfully deleted your account.`,
        html: `<p>Dear <b>${user.first_name}</b>!</p><br><p>You have successfully deleted your account</p>`,
      });
  }

  async _send(mail) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        secure: false,
      });
      mail.subject = subjectPrefix + mail.subject;
      mail.html = `<html><head></head><body>${mail.html}</body></html>`;
      return transporter.sendMail({
        from: defaultFrom,
        ...mail,
      });
    } catch (e) {
      console.log(e);
      return null;
    }
  }
}

module.exports = new EmailService();
