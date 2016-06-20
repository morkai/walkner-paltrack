// Part of <https://miracle.systems/p/walkner-paltrack> licensed under <CC BY-NC-SA 4.0>

'use strict';

var setUpRoutes = require('./routes');
var setUpDailyBalance = require('./dailyBalance');
var setUpChecker = require('./checker');
var setUpAutomater = require('./automater');

exports.DEFAULT_CONFIG = {
  mongooseId: 'mongoose',
  expressId: 'express',
  userId: 'user',
  partnersId: 'partners',
  palletKindsId: 'palletKinds',
  gdnStoragePath: './gdn',
  wkhtmltopdfUrl: 'http://127.0.0.1/',
  wkhtmltopdfCmd: 'wkhtmltopdf',
  automate: false
};

exports.start = function startRegistryModule(app, registryModule)
{
  var config = registryModule.config;

  app.onModuleReady(
    [
      config.mongooseId,
      config.userId,
      config.expressId,
      config.partnersId,
      config.palletKindsId
    ],
    setUpRoutes.bind(null, app, registryModule)
  );

  app.onModuleReady(
    [
      config.mongooseId,
      config.partnersId,
      config.palletKindsId
    ],
    setUpDailyBalance.bind(null, app, registryModule)
  );

  app.onModuleReady(
    [
      config.mongooseId
    ],
    setUpChecker.bind(null, app, registryModule)
  );

  app.onModuleReady(
    [
      config.mongooseId,
      config.partnersId
    ],
    setUpAutomater.bind(null, app, registryModule)
  );
};
