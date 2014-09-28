// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-paltrack project <http://lukasz.walukiewicz.eu/p/walkner-paltrack>

'use strict';

var setUpRoutes = require('./routes');
var setUpDailyBalance = require('./dailyBalance');
var setUpChecker = require('./checker');

exports.DEFAULT_CONFIG = {
  mongooseId: 'mongoose',
  expressId: 'express',
  userId: 'user',
  partnersId: 'partners',
  palletKindsId: 'palletKinds',
  gdnStoragePath: './gdn',
  wkhtmltopdfUrl: 'http://127.0.0.1/',
  wkhtmltopdfCmd: 'wkhtmltopdf'
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
};
