/**
 * I know, this file isn't okay, but has no time refactoring it
 */

const fs = require('fs');

class FileService {
  static async unlink(file, calle) {
    return fs.unlink(file, calle);
  }
  static async writeFile(file, data, type, calle) {
    return fs.writeFile(file, data, type, calle);
  }
  static async exists(file) {
    return fs.existsSync(file);
  }
  static async getUrl(file) {
    if ((await FileService.exists(file))) {
      return 'file:///' + file;
    }
    return null;
  }
}

// Load the AWS SDK for Node.js
var AWS = require('aws-sdk');
// Set the region
AWS.config.region = 'eu-west-3';
AWS.config.signatureVersion = 'v4';
const s3 = new AWS.S3({
  apiVersion: '2006-03-01'
});

class S3Service {
  static async unlink(file, calle) {
    return s3.deleteObject({
      Bucket: process.env.S3_BUCKET,
      Key: file,
    }, calle);
  }
  static async writeFile(file, data, type, calle) {
    const body = Buffer.from(data, type);
    const params = {
        Body: body,
        Bucket: process.env.S3_BUCKET,
        Key: file,
        ServerSideEncryption: "AES256",
        StorageClass: "STANDARD_IA"
    };
    return s3.putObject(params, calle);
  }
  static async exists(file) {
    try {
      await s3.headObject({
        Bucket: process.env.S3_BUCKET,
        Key: file,
      }).promise();
      return true;
    } catch (e) {
    }
    return false;
  }
  static async getUrl(file) {
    const params = {Bucket: process.env.S3_BUCKET, Key: file};
    if ((await S3Service.exists(file))) {
      return  s3.getSignedUrl('getObject', params);
    }
    return null;
  }
  static async read(file) {
    if (await S3Service.exists(file)) {
      const res = await s3.getObject({Bucket: process.env.S3_BUCKET, Key: file}).promise()
      return res.Body;
    }
    return null;
  }
}

module.exports = S3Service;
