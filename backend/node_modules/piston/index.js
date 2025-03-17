var pathetic = require('pathetic');
var Route = require('./lib/route');

var Piston = function () {
  this.routes = {};
};

Piston.Route = Route;

Piston.prototype.register = function (options) {
  var piston = this;
  
  // Handle array of routes
  if (Array.isArray(options)) {
    return options.map(function (option) {
      return piston.register(option);
    });
  }
  
  if (!options.path) throw new Error('A route requires a path');
  
  var method = options.method || 'GET';
  var pathname = options.path;
  
  var routeMethod = this.routes[method.toLowerCase()] || (this.routes[method.toLowerCase()] = {});
  routeMethod[pathname] = new Route(options);
  
  return this.lookup(pathname, method);
};

Piston.prototype.lookup = function (pathname, method) {
  var routes = pathetic(this.routes[method.toLowerCase()]);
  return routes(pathname);
};

Piston.prototype.getRoute = function (pathname, method) {
  if (!method) method = 'GET';
  method = method.toLowerCase();
  
  return this.routes[method]
    ? this.routes[method][pathname]
    : undefined;
};

Piston.prototype.reset = function () {
  this.routes = {};
};

module.exports = Piston;