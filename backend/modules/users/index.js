// Part of <https://miracle.systems/p/walkner-paltrack> licensed under <CC BY-NC-SA 4.0>

'use strict';

var setUpRoutes = require('./routes');

exports.DEFAULT_CONFIG = {
  mongooseId: 'mongoose',
  expressId: 'express',
  userId: 'user',
  sioId: 'sio',
  mailSenderId: 'mail/sender',
  browsePrivileges: ['USERS:VIEW']
};

exports.start = function startUsersModule(app, usersModule)
{
  usersModule.syncing = false;

  app.onModuleReady(
    [
      usersModule.config.mongooseId,
      usersModule.config.userId,
      usersModule.config.expressId
    ],
    setUpRoutes.bind(null, app, usersModule)
  );
};
