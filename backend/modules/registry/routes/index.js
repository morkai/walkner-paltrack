// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-paltrack project <http://lukasz.walukiewicz.eu/p/walkner-paltrack>

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
