// Part of <https://miracle.systems/p/walkner-tp> licensed under <CC BY-NC-SA 4.0>

'use strict';

const setUpRoutes = require('./routes');

exports.DEFAULT_CONFIG = {
  mongooseId: 'mongoose',
  expressId: 'express',
  userId: 'user',
  settingsId: 'settings',
  mailSenderId: 'mail/sender',
  browsePrivileges: ['USERS:VIEW']
};

exports.start = function startUsersModule(app, module)
{
  app.onModuleReady(
    [
      module.config.mongooseId,
      module.config.userId,
      module.config.expressId,
      module.config.settingsId
    ],
    setUpRoutes.bind(null, app, module)
  );
};
