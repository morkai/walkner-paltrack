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

  express.get('/reports/partner-balance', canView, partnerBalanceRoute);

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

        res.json(partnerToBalanceMap);
      }
    );
  }

  function partnerBalanceRoute(req, res, next)
  {
    var user = req.session.user;
    var partner = req.query.partner;
    var from = moment(req.query.from || null);
    var to = moment(req.query.to || null);

    if (!partner || user.partner)
    {
      partner = user.partner;
    }

    if (!partner || !from.isValid() || !to.isValid())
    {
      return res.json([]);
    }

    var conditions = {
      partner: partner,
      date: {
        $gte: from.toDate(),
        $lt: to.toDate()
      }
    };
    var fields = {
      _id: 0,
      date: 1,
      'goods.total': 1,
      'daily.grnByPartner': 1,
      'daily.gdnByPartner': 1
    };

    DailyBalance.find(conditions, fields).sort({partner: 1, date: 1}).exec(function(err, dailyBalances)
    {
      if (err)
      {
        return next(err);
      }

      return res.json(dailyBalances);
    });
  }
};
