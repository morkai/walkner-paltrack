// Part of <https://miracle.systems/p/walkner-paltrack> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setUpBalanceRoutes(app, registryModule)
{
  var express = app[registryModule.config.expressId];
  var userModule = app[registryModule.config.userId];

  var canManage = userModule.auth('REGISTRY:RECOUNT');

  express.get('/registry;recount', canManage, function(req, res, next)
  {
    res.setTimeout(0);

    registryModule.recountPartnersDailyBalance(req.session.user.partner, null, function(err)
    {
      if (err)
      {
        return next(err);
      }

      res.end();
    });
  });
};
