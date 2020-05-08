'use strict';

const http = require('http');
const https = require('https');
const querystring = require('querystring');
const _ = require('lodash');

module.exports = {
  checkValidity,
  getAppsName,
  revokeClientPermission,
};

/**
 *
 * @param data
 * @param valueFn Called on success
 * @param errorFn Called on error
 */
function checkValidity(data, valueFn, errorFn) {
  const postData = querystring.stringify(data);
  const options = {
    path: '/api/validate-client',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(postData),
    },
  };
  doRequest({options, postData}, valueFn, errorFn);
}

function getAppsName(appIds, valueFn, errorFn) {
  const data = querystring.stringify({client_ids: appIds});
  const options = {
    path: '/api/clients?' + data, // ?? ?? ??
    method: 'GET',
  };
  doRequest({options}, valueFn, errorFn);
}

function revokeClientPermission({clientId, userId}, valueFn, errorFn) {
  const options = {
    path: `/api/client/${clientId}/user/${userId}`,
    method: 'DELETE',
  };
  doRequest({options}, valueFn, errorFn);
}

function doRequest({options, postData}, valueFn, errorFn) {
  const requestOptions = {
    hostname: process.env.AUTH_API_HOSTNAME,
    port: process.env.AUTH_API_PORT,
    ...options
  };
  const request = https.request(requestOptions, (resIn) => {
    let body = '';
    resIn.on('data', (chunk) => {
      body += chunk;
    });
    resIn.on('end', () => {
      const result = JSON.parse(body);
      if (typeof valueFn === 'function') {
        valueFn(result);
      }
    });
  });

  request.on('error', (e) => {
    console.log(e);
    if (typeof errorFn === 'function') {
      errorFn({
        result: {
          is_valid: false,
          error_code: 'Internal Server error',
        },
        error: e,
      });
    }
  });
  if (postData) {
    request.write(postData);
  }
  request.end();
}

