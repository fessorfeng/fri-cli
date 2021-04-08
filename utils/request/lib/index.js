'use strict';

const axios = require('axios');

const request = axios.create({
  baseURL: process.env.TEMPLATE_URL || 'http://127.0.0.1:7001/',
  timeout: 5000,
});
request.interceptors.response.use(function (response) {
  return response.data;
}, function (error) {
  return Promise.reject(error);
});

module.exports = request;
