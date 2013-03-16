/*
 * realurl
 * https://github.com/manuelvanrijn/node-realurl
 *
 * Copyright (c) 2012 Manuel van Rijn
 * Licensed under the MIT license.
 */

var url   = require('url');
var https = require('https');
var http  = require('http');

function getUrl(href, callback) {
  var src  = url.parse(href);
  var req  = src.protocol === 'https:' ? https : http;

  req.get(src, function (res) {
    // Found: MUST NOT automatically redirect according to the RFC2616 spec's
    if (res.statusCode === 302) {
      callback(null, res.headers.location);
    }
    // Redirect: Requests between statusCode 300 and 400 (except 302) should be redirected
    else if (res.statusCode > 300 && res.statusCode < 400 && res.headers.location) {
      getUrl(res.headers.location, callback);
    }
    // Unknown short url
    else if (res.statusCode === 404) {
      callback(new Error('URL resulted in a 404'), null);
    }
    // All fine, return the final href
    else {
      callback(null, src.href);
    }
  });
}

module.exports = {
  get: function(url, callback) {
    if(typeof url === 'function') {
      callback = url;
      url = null;
    }

    if(typeof url !== 'string' || url.length < 1) {
      return callback(new Error('Please specify a short url'), null);
    }

    getUrl(url, callback);
  }
};
