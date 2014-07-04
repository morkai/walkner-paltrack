// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-paltrack project <http://lukasz.walukiewicz.eu/p/walkner-paltrack>

'use strict';

var setUpRoutes = require('./routes');
var setUpDailyBalance = require('./dailyBalance');

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

exports.start = function startRegistryModule(app, module)
{
  app.onModuleReady(
    [
      module.config.mongooseId,
      module.config.userId,
      module.config.expressId,
      module.config.partnersId,
      module.config.palletKindsId
    ],
    setUpRoutes.bind(null, app, module)
  );

  app.onModuleReady(
    [
      module.config.mongooseId,
      module.config.partnersId,
      module.config.palletKindsId
    ],
    setUpDailyBalance.bind(null, app, module)
  );
};
