const request = require('request');
const XML = require('simple-xml');
const zlib = require('zlib');
 
 
class HandSoap {
  request(url, operation, action, body, options, auth) {
    return new Promise((resolve, reject) => {
      const xml = this.envelope(operation, body, options);
      const httpHeaders = options.httpHeaders || {};

      const requestOptions = {
        url,
        body: xml,
        headers: this.headers(action, xml.length, httpHeaders)
      };

      if (typeof auth !== 'undefined') {
        requestOptions.auth = {
          user: auth.user || auth.username,
          pass: auth.pass || auth.password
        }
      }

      const req = request.post(requestOptions, (err, response, body) => {
        if (err || response.statusCode !== 200) {
          const error = err ?
            err :
            `Http Status code: ${response.statusCode}`;

          reject(error);
          return; 
        }

        resolve(XML.parse(body));
      });
    })
  }

  envelope(operation, body, options) {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>';
    xml += '<env:Envelope xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ' +
      'xmlns:env="http://schemas.xmlsoap.org/soap/envelope/" ' + this.namespaces(options.namespaces) + '>';

    if (options.soapHeaders) {
      xml += '<env:Header>';
      xml += typeof options.soapHeaders === 'object' ? XML.stringify(options.soapHeaders) : options.soapHeaders.toString();
      xml += '</env:Header>';
    }

    xml += '<env:Body>';
    xml += this.serializeOperation(operation, options);
    xml += typeof body === 'object' ? XML.stringify(body) : body.toString();
    xml += '</' + operation + '>';
    xml += '</env:Body>';
    xml += '</env:Envelope>';

    return xml;
  }

  headers(action, length, httpHeaders) {
    let headers = {
      Soapaction: action,
      'Content-Type': 'text/xml;charset=UTF-8',
      'Content-Length': length,
      'Accept-Encoding': 'gzip',
      Accept: '*/*'
    }

    for (let i in httpHeaders) {
      headers[i] = httpHeaders[i];
    }

    return headers;
  }

  namespaces(ns) {
    let attributes = '';
    for (let name in ns) {
      attributes += name + '="' + ns[name] + '" ';
    }
    return attributes.trim();
  }

  serializeOperation(operation, options) {
    return '<' + operation + (options.namespace ? ' xmlns="' + options.namespace + '"' : '') + '>';
  }

  gunzip(callback) {
    let gunzip = zlib.createGunzip();
    gunzip.on('error', callback);
    return gunzip;
  }

  isGzipped(response) {
    return /gzip/.test(response.headers['content-encoding']);
  }
}

module.exports = new HandSoap;
