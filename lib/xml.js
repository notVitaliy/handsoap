const parseString = require('xml2js').parseString;

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
    parseString(data, (err, result) => {
      if (err) {
        reject(err);
      }
      else {
        resolve(result);
      }
    });
  });
}
