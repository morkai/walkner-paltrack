// Part of <https://miracle.systems/p/walkner-paltrack> licensed under <CC BY-NC-SA 4.0>

'use strict';

var setUpGrnRoutes = require('./grn');
var setUpGdnRoutes = require('./gdn');
var setUpObRoutes = require('./ob');
var setUpBalanceRoutes = require('./balance');
var setUpReportsRoutes = require('./reports');

module.exports = function setUpRegistryRoutes(app, registryModule)
{
  setUpGrnRoutes(app, registryModule);
  setUpGdnRoutes(app, registryModule);
  setUpObRoutes(app, registryModule);
  setUpBalanceRoutes(app, registryModule);
  setUpReportsRoutes(app, registryModule);
};
