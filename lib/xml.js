const xml2js = require('xml2js');
const parseString = xml2js.parseString;

exports.stringify = stringify;
exports.parse = parse;

function stringify (obj) {
  var xml = '';
  for (var key in obj) {
    var value = obj[key];
    if (Array.isArray(value)) {
      value.forEach(function (item) {
        if (typeof item === 'object')
          xml += '<' + key + '>' + stringify(item) + '</' + key + '>';
        else
          xml += '<' + key + '>' + item + '</' + key + '>';
      });
    } else if (typeof value === 'object') {
      xml += '<' + key + '>' + stringify(value) + '</' + key + '>';
    } else {
      xml += '<' + key + '>' + value + '</' + key + '>';
    }
  }
  return xml;
}

function parse (data) {
  return new Promise((resolve, reject) => {
    const options = {
      ignoreAttrs: true,
      explicitArray: false,
      tagNameProcessors: [
        (name) => {
          return name.slice(name.indexOf(':') + 1, name.length);
        }
      ]
    };

    parseString(data, options, (err, result) => {
      if (err) {
        reject(err);
      }
      else {
        resolve(result);
      }
    });
  });
}
