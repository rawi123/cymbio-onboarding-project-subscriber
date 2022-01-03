# Health Check Message Format

## CI
[![Circle CI](https://circleci.com/gh/LucasRodrigues/health-check-message-format/tree/master.svg?style=svg)](https://circleci.com/gh/LucasRodrigues/health-check-message-format/tree/master)

## Install

```
$ npm install health-check-message-format
```

## Usage

```
var healthCheckMessageFormat = require('health-check-message-format');
var statuses = [
    {
      error: null,
      name: '123'
   },{
     error: 'abc',
     name: '123'
   }
];
var configuration = {
  fnIsHealthGood: status =>{
    return status.error === null
  },
  fnName:status => {
    return status.name;
  },
  fnErrorMessage: status => {
    return status.error
  }
}

healthCheckMessageFormat.do(statuses,configuration)
/*
{ health: false,
  success: 1,
  error: 1,
  details: 
   [ { name: '123', health: true, message: '' },
     { name: '123', health: false, message: 'abc' } ] 
}
*/
```