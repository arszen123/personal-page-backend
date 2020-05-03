'use strict';

const fs = require('fs');
const pdf = require('html-pdf');
const path = require("path");
const Languages = require('languages');

module.exports = class CvBuilderService {
  constructor(user, userId, page) {
    this.user = user;
    this.page = page;
    this.userId = userId;
  }

  buildPDF() {
    return pdf.create(this.buildHtml(), {
      'format': 'A4',
      'border': {
        'top': '25px',
        'right': '50px',
        'bottom': '50px',
        'left': '50px',
      },
    });
  }

  buildHtml() {
    return `<html>${this._createHeader()}${this._createBody()}${this._createFooter()}</html>`;
  }

  _createBody() {
    const data = this._initData();
    let res = '';
    let contentRes = '';
    res += this._createBodyHeader(data['contact']);
    contentRes += this._createPersonalInformation();
    contentRes += this._createEducations(data['education']);
    contentRes += this._createExperiences(data['experience']);
    contentRes += this._createLanguage(data['language']);
    contentRes += this._createSkills(data['skill']);

    return res + `<div id="content">${contentRes}</div>`;
  }

  _createBodyHeader(contacts) {
    const basePath = './data/profile_picture';
    let imgSrc = null;
    try {
      if (fs.existsSync(`${basePath}/${this.userId}.png`)) {
        imgSrc = 'file://' + path.resolve(`${basePath}/${this.userId}.png`);
      }
    } catch (e) {
    }
    const img = imgSrc !== null ? `<img src="${imgSrc}">` : '';
    const contactHtmls = [];
    if (typeof contacts !== 'undefined') {
      for (const contactsKey in contacts) {
        const contact = contacts[contactsKey];
        let contactType = contact.type === 'other' ? contact.other_type : contact.type;
        const contactValue = contact.type === 'phone' ? `<a href="call:${contact.value}">${contact.value}</a>` : contact.value;
        contactType = this._ucfirst(contactType);
        contactHtmls.push(`<p><b>${contactType}:</b> ${contactValue}</p>`);
      }
    }
    const contactHtml = contactHtmls.join('');
    return `
<div id="header">
    <div id="data-section">
        <h1>${this.user.first_name} ${this.user.last_name}</h1>
        ${contactHtml}
    </div>
    ${img}
</div>`;
  }

  _createPersonalInformation() {
    const user = this.user;
    const data = [];
    if (typeof user.birth_date !== 'undefined') {
      data.push(`<p><b>Date of birth:</b> ${user.birth_date}</p>`);
    }
    if (typeof user.birth_place !== 'undefined') {
      data.push(`<p><b>Place of birth:</b> ${user.birth_place}</p>`)
    }
    if (typeof user.living_place !== 'undefined') {
      data.push(`<p><b>Living:</b> ${user.living_place}</p>`)
    }
    if (data.length === 0) {
      return '';
    }
    const html = data.join('');
    return `<div class="content-section">
        <h2>Personal Information</h2>
        <div class="content-section-data">
            <div>
                ${html}
            </div>
        </div>
    </div>`;
  }

  _createEducations(educations) {
    if (typeof educations === 'undefined' || educations.length === 0) {
      return '';
    }
    const data = [];

    for (const educationsKey in educations) {
      const education = educations[educationsKey];
      const from = this._dateToFormatedString(education.from);
      const to = this._dateToFormatedString(education.to);
      data.push(`<div>
        <h4>${from} - ${to}</h4>
      <h3>${education.institute}</h3>
      <p><b>Major:</b> ${education.specialization}</p></div>`);
    }
    if (data.length === 0) {
      return '';
    }
    const html = data.join('');
    return `<div class="content-section">
        <h2>Educations</h2>
        <div class="content-section-data">
        ${html}
        </div>
    </div>`
  }

  _createExperiences(experiences) {
    if (typeof experiences === 'undefined' || experiences.length === 0) {
      return '';
    }
    const data = [];

    for (const idx in experiences) {
      const experience = experiences[idx];
      const from = this._dateToFormatedString(experience.from);
      const to = experience.is_current ? 'CURRENTLY' : this._dateToFormatedString(experience.to);
      data.push(`
            <div>
                <h4>${from} - ${to}</h4>
                <h3>${experience.position} / <span class="company">${experience.company_name}</span></h3>
                <p>${experience.description}</p>
            </div>
        `);
    }
    if (data.length === 0) {
      return  '';
    }

    const html = data.join('');

    return `<div class="content-section">
        <h2>Experience</h2>
        <div class="content-section-data">
            ${html}
        </div>
    </div>`
  }

  _createLanguage(languages) {
    if (typeof languages === 'undefined' || languages.length === 0) {
      return '';
    }

    const data = [];
    for (const idx in languages) {
      const language = languages[idx];
      const lang = Languages.getLanguageInfo(language.lang_id).name;
      const langLevel = this._ucfirst(language.lang_level_id);
      data.push(`
            <div>
                <p><b>Language:</b> ${lang}</p>
                <p><b>Level:</b> ${langLevel}</p>
            </div>`)
    }
    if (data.length === 0) {
      return '';
    }

    const html = data.join('');

    return `
    <div class="content-section">
        <h2>Languages</h2>
        <div class="content-section-data">
            ${html}
        </div>
    </div>`
  }

  _createSkills(skills) {
    if (typeof skills === 'undefined' || skills[0].length === 0) {
      return '';
    }
    skills = skills[0];
    const skillHtmls = [];
    for (const dataKey in skills) {
      const skill = skills[dataKey];
      skillHtmls.push(`<div class="badge"><p>${skill}</p></div>`);
    }
    const skillHtml = skillHtmls.join('');
    return `
<div class="content-section">
    <h2>Skills</h2>
    <div style="text-align: center">
        ${skillHtml}
    </div>
</div>`;
  }

  _initData() {
    const data = {};
    for (const pageKey in this.page) {
      if (!this.page.hasOwnProperty(pageKey)) continue;
      const widget = this.page[pageKey];
      if (typeof data[widget.type] === 'undefined') {
        data[widget.type] = [];
      }
      data[widget.type].push(widget.data);
    }
    return data;
  }

  _createHeader() {
    return `<head>
    <meta charset="UTF-8">
    <style>
        body {
            color: dimgrey;
            font-size: 11px;
        }
        #header {
            margin-bottom: 0px;
        }

        #header #data-section {
            width: 50%;
            height: 125px;
        }

        #data-section p {
            margin: 2px;
        }

        #header img {
            width: 125px;
            height: 125px;
            position: absolute;
            right: 10px;
            top: 23px;
        }

        h1 {
            font-size: 35px;
            color: black;
            margin-bottom: 10px;
        }
        .content-section h2 {
            color: black;
            font-size: 18px;
            border-bottom: 2px solid black;
            padding-bottom: 3px;
            margin-bottom: 10px;
        }
        .content-section-data h4 {
            margin: 2px;
        }
        .content-section-data h3 {
            margin: 2px;
            color: #663399;
            font-size: 16px;
        }
        .content-section-data p {
            margin: 2px;
        }
        .content-section-data div {
            margin-bottom: 15px;
        }
        .content-section-data div:last-child {
            margin-bottom: 0;
        }

        .badge {
            color: white;
            background-color: #663399;
            width: max-content;
            display: inline-block;
            border-radius: 25px;
            margin-left: 3px;
        }
        .badge p {
            margin: 5px 10px;
            white-space: nowrap;
        }
        .company {
            color: dimgrey;
        }

        #footer {
            margin-top: 10px;
            text-align: center;
            bottom: 25px;
            width: 100%;
        }
    </style>
</head>`;
  }

  _createFooter() {
    return `<div id="footer">
    Generated By <a href="${process.env.FRONTEND_APP_URL}" target="_blank">Personal Page</a>
</div>`;
  }

  _dateToFormatedString(date) {
    date = new Date(date);
    const month = date.getMonth() < 10 ? '0' + date.getMonth() : date.getMonth();
    const day = date.getDay() < 10 ? '0' + date.getDay() : date.getDay();
    return date.getFullYear() + '-' + month + '-' + day;
  }

  _ucfirst(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }
};
