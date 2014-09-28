// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-paltrack project <http://lukasz.walukiewicz.eu/p/walkner-paltrack>

'use strict';

var step = require('h5.step');
var moment = require('moment');

module.exports = function setUpGrnRoutes(app, registryModule)
{
  var express = app[registryModule.config.expressId];
  var userModule = app[registryModule.config.userId];
  var mongoose = app[registryModule.config.mongooseId];
  var DailyBalance = mongoose.model('DailyBalance');

  var canView = userModule.auth('REPORTS:VIEW');

  express.get('/reports/daily-balance', canView, dailyBalanceRoute);

  function dailyBalanceRoute(req, res, next)
  {
    step(
      function()
      {
        var conditions = {
          date: moment(req.query.date).hours(0).minutes(0).seconds(0).milliseconds(0).toDate()
        };

        if (req.session.user.partner)
        {
          conditions.partner = req.session.user.partner;
        }

        DailyBalance.find(conditions, {partner: 1, 'goods.total': 1}).lean().exec(this.next());
      },
      function(err, dailyBalances)
      {
        if (err)
        {
          return next(err);
        }

        var partnerToBalanceMap = {};

        for (var i = 0, l = dailyBalances.length; i < l; ++i)
        {
          var dailyBalance = dailyBalances[i];

          if (!dailyBalance.goods || !Object.keys(dailyBalance.goods.total).length)
          {
            continue;
          }

          partnerToBalanceMap[dailyBalance.partner] = dailyBalance.goods.total;
        }

        res.send(partnerToBalanceMap);
      }
    );
  }
};
