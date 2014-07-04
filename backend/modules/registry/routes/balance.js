// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-paltrack project <http://lukasz.walukiewicz.eu/p/walkner-paltrack>

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
