/// <reference path="./simple-xml.d.ts" />
var request = require('request');
var simple_xml_1 = require('simple-xml');
var zlib = require('zlib');
;
var HandSoap = (function () {
    function HandSoap() {
    }
    HandSoap.prototype.request = function (url, operation, action, body, options, auth) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var xml = _this.envelope(operation, body, options);
            var httpHeaders = options.httpHeaders || {};
            var requestOptions = {
                url: url,
                body: xml,
                headers: _this.headers(action, xml.length, httpHeaders)
            };
            if (typeof auth !== 'undefined') {
                requestOptions.auth = {
                    user: auth.user || auth.username,
                    pass: auth.pass || auth.password
                };
            }
            request.post(requestOptions, function (err, response, body) {
                if (err || response.statusCode !== 200) {
                    var error = err ?
                        err :
                        "Http Status code: " + response.statusCode;
                    reject(error);
                }
                if (_this.isGzipped(response)) {
                    _this.gunzip(reject);
                }
                else {
                    resolve(simple_xml_1.XML.parse(body));
                }
            });
        });
    };
    HandSoap.prototype.envelope = function (operation, body, options) {
        var xml = '<?xml version="1.0" encoding="UTF-8"?>';
        xml += '<env:Envelope xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ' +
            'xmlns:env="http://schemas.xmlsoap.org/soap/envelope/" ' + this.namespaces(options.namespaces) + '>';
        if (options.soapHeaders) {
            xml += '<env:Header>';
            xml += typeof options.soapHeaders === 'object' ? simple_xml_1.XML.stringify(options.soapHeaders) : options.soapHeaders.toString();
            xml += '</env:Header>';
        }
        xml += '<env:Body>';
        xml += this.serializeOperation(operation, options);
        xml += typeof body === 'object' ? simple_xml_1.XML.stringify(body) : body.toString();
        xml += '</' + operation + '>';
        xml += '</env:Body>';
        xml += '</env:Envelope>';
        return xml;
    };
    HandSoap.prototype.headers = function (action, length, httpHeaders) {
        var headers = {
            Soapaction: action,
            'Content-Type': 'text/xml;charset=UTF-8',
            'Content-Length': length,
            'Accept-Encoding': 'gzip',
            Accept: '*/*'
        };
        for (var i in httpHeaders) {
            headers[i] = httpHeaders[i];
        }
        return headers;
    };
    HandSoap.prototype.namespaces = function (namespaces) {
        var attributes = '';
        for (var name_1 in namespaces) {
            attributes += name_1 + '="' + namespaces[name_1] + '" ';
        }
        return attributes.trim();
    };
    HandSoap.prototype.serializeOperation = function (operation, options) {
        return '<' + operation + (options.namespace ? ' xmlns="' + options.namespace + '"' : '') + '>';
    };
    HandSoap.prototype.gunzip = function (callback) {
        var gunzip = zlib.createGunzip();
        gunzip.on('error', callback);
        return gunzip;
    };
    HandSoap.prototype.isGzipped = function (response) {
        return /gzip/.test(response.headers['content-encoding']);
    };
    return HandSoap;
})();
exports.HandSoap = HandSoap;
