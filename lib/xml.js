const xml2js = require('xml2js');
const parseString = xml2js.parseString;

exports.stringify = stringify;
exports.parse = parse;

function stringify (obj) {
  let builder = new xml2js.Builder({headless: true, renderOpts: {pretty: true, newline: '', indent: ''} });
  let xml = builder.buildObject(obj);

  return xml;
}

function parse (data) {
  return new Promise((resolve, reject) => {
    const options = {
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
