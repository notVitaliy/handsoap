/// <reference path="./simple-xml.d.ts" />

import * as request from 'request';
import { XML } from 'simple-xml';
import * as zlib from 'zlib';

interface Options {
  httpHeaders?: {
    [key: string]: string;
  };
  soapHeaders?: {
    [key: string]: string;
  } | string;
  namespaces?: {
    [key: string]: string;
  };
  namespace?: string;
};

interface Auth {
  user?: string;
  username?: string;
  pass?: string;
  password?: string;
  bearer?: string;

  [key: string]: any;  
}

interface RequestOptions {
  url: string;
  body: string;
  auth?: Auth;

  [key: string]: any;
}

export class HandSoap {
  request(url: string, operation: string, action: string, body: string | Object, options: Options, auth: Auth): Promise<Object> {
    return new Promise((resolve, reject) => {
      const xml: string = this.envelope(operation, body, options);
      const httpHeaders: Object = options.httpHeaders || {};

      const requestOptions: RequestOptions = {
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

      request.post(requestOptions, (err: any, response: any, body: string): void => {
        if (err || response.statusCode !== 200) {
          const error: string = err ?
            err :
            `Http Status code: ${response.statusCode}`;

          reject(error);
        }

        if (this.isGzipped(response)){
          this.gunzip(reject);
        }
        else {
          resolve(XML.parse(body));
        }

      });
    })
  }

  envelope(operation: string, body: string | Object, options: Options): string {
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

  headers(action: string, length: number, httpHeaders: Object): Object {
    let headers: Object = {
      Soapaction: action,
      'Content-Type': 'text/xml;charset=UTF-8',
      'Content-Length': length,
      'Accept-Encoding': 'gzip',
      Accept: '*/*'
    };

    for (let i in httpHeaders) {
      headers[i] = httpHeaders[i];
    }

    return headers;
  }

  namespaces(namespaces: Object): string {
    let attributes = '';
    for (let name in namespaces) {
      attributes += name + '="' + namespaces[name] + '" ';
    }
    return attributes.trim();
  }

  serializeOperation(operation: string, options: Options): string {
    return '<' + operation + (options.namespace ? ' xmlns="' + options.namespace + '"' : '') + '>';
  }

  gunzip(callback: Function): any {
    let gunzip = zlib.createGunzip();
    gunzip.on('error', callback);
    return gunzip;
  }

  isGzipped(response): boolean {
    return /gzip/.test(response.headers['content-encoding']);
  }
}
