const xml = require('../lib/xml');

describe('XML', () => {
  const xmlString = '<root><child>test</child></root>';
  const xmlObj = {
    root: {
      child: 'test'
    }
  };

  it ('should parse string', (done) => {
    xml.parse(xmlString).then((parsed) => {
      expect(parsed).toEqual(xmlObj);
      done();
    });
  });

  it('should create xml', () => {
    expect(xml.stringify(xmlObj)).toEqual(xmlString);
  });
});
