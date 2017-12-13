describe('HandSoap', () => {
  let handsoap;

  beforeEach(() => {
    handsoap = require('../lib/handsoap');
  });

  it('should init', () => {
    expect(handsoap).toBeTruthy();
  });

  it('should create http headers array', () => {
    const expected = {
      SOAPAction: 'test',
      'Content-Type': 'text/xml;charset=UTF-8',
      Accept: '*/*'
    };

    const headers = handsoap.headers('test', 4, {});

    expect(headers).toEqual(expected);
  });

  it('should create namespace attributes', () => {
    const expected = 'xmlns:foo="bar" xmlns:cat="dog"';

    const namespaces = {
      foo: 'bar',
      cat: 'dog'
    };
    const nsAttrs = handsoap.namespaces(namespaces)

    expect(nsAttrs).toEqual(nsAttrs);
  });

  it('should serialize operation with no namespace', () => {
    const operation = 'myoperation';

    const expected = '<myoperation>';
    const serialized = handsoap.serializeOperation(operation, {});

    expect(serialized).toEqual(expected);
  });

  it('should serialize operation with namespace', () => {
    const operation = 'ns1:myoperation';
    const options = {
      namespace: 'https://example.com/xmlns'
    };

    const expected = '<ns1:myoperation xmlns="https://example.com/xmlns">';
    const serialized = handsoap.serializeOperation(operation, options);

    expect(serialized).toEqual(expected);
  });

});
