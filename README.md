# handsoap

```javascript
const handsoap = require('handsoap');

const url = 'MY URL';
const operation = 'MyOper';
const action = 'MyAction';
const body = {
  some: {
    data: 'here'
  }
};

const options = {
  httpHeaders: {
    http: 'Header'
  },
  soapHeaders: {
    soap: 'Header'
  },
  namespace: 'MyNamespace
}

handsoap(url, operation, action, body, options, auth).then((response) => {
  // Success
}, (err) => {
  // Error
});

```
