# piston

A route/path storing and parsing engine.

## Install

```
npm install piston --save
```

## Usage 

```js
var Piston = require('piston');
var table = new Piston();

table.register({
  method: 'GET',
  path: '/my-path/:id',
  before: function (req, res, next) {
    // Do something here
    next();
  },
  handler: function (req, res) {
    console.log(req.params.id);
    res.end('you got served!');
  }
});

var route = table.lookup('/my-path/123');
route.params() === {id: 123};

// Run 'before' methods
route.before(req, res, function () {
  // Done
});

// Run 'before' methods and 'handler'
route.handler(req, res);
```

## Run Tests

```
npm install
npm test
```
