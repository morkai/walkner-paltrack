// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-paltrack project <http://lukasz.walukiewicz.eu/p/walkner-paltrack>

'use strict';

var lodash = require('lodash');
var limitToPartner = require('./limitToPartner');
var recordChanges = require('./recordChanges');
var checkGnRoute = require('./checkGnRoute');

module.exports = function setUpGrnRoutes(app, registryModule)
{
  var express = app[registryModule.config.expressId];
  var userModule = app[registryModule.config.userId];
  var Grn = app[registryModule.config.mongooseId].model('Grn');
  var Gdn = app[registryModule.config.mongooseId].model('Gdn');

  var canView = userModule.auth('REGISTRY:VIEW');
  var canManage = userModule.auth('REGISTRY:MANAGE');

  express.get(
    '/registry/grn',
    canView,
    limitToPartner.bind(null, 'receiver'),
    express.crud.browseRoute.bind(null, app, Grn)
  );

  express.get('/registry/grn;gdn', canView, getGoodsFromGdnRoute);

  express.post(
    '/registry/grn',
    canManage,
    checkForDuplicateGrn,
    prepareNewGrnModel,
    express.crud.addRoute.bind(null, app, Grn)
  );

  express.get('/registry/grn/:id', canView, express.crud.readRoute.bind(null, app, Grn));

  express.post(
    '/registry/grn/:id;check',
    userModule.auth('REGISTRY:CHECK'),
    checkGnRoute.bind(null, app, registryModule, Grn)
  );

  express.put(
    '/registry/grn/:id',
    canManage,
    checkForDuplicateGrn,
    prepareExistingGrnModel,
    express.crud.editRoute.bind(null, app, Grn)
  );

  express.del('/registry/grn/:id', canManage, express.crud.deleteRoute.bind(null, app, Grn));

  function prepareNewGrnModel(req, res, next)
  {
    if (req.session.user.partner && req.body.receiver !== req.session.user.partner)
    {
      res.statusCode = 400;

      return next(new Error('receiver:privilege'));
    }

    req.model = new Grn({
      receiver: req.body.receiver,
      supplier: req.body.supplier,
      date: req.body.date + ' 00:00:00',
      docNo: req.body.docNo,
      goods: req.body.goods,
      createdAt: new Date(),
      creator: userModule.createUserInfo(req.session.user, req),
      updatedAt: null,
      updater: null,
      changes: []
    });

    next();
  }

  function prepareExistingGrnModel(req, res, next)
  {
    if (req.session.user.partner && req.body.receiver !== req.session.user.partner)
    {
      res.statusCode = 400;

      return next(new Error('receiver:privilege'));
    }

    Grn.findById(req.params.id, function(err, grn)
    {
      if (err)
      {
        return next(err);
      }

      req.model = grn;

      if (!grn)
      {
        return next();
      }

      var changeCount = recordChanges(
        grn,
        lodash.pick(req.body, ['date', 'docNo', 'goods']),
        userModule.createUserInfo(req.session.user, req)
      );

      if (changeCount === 0)
      {
        res.statusCode = 400;

        return next(new Error('NO_CHANGES'));
      }

      req.body = {};

      next();
    });
  }

  function checkForDuplicateGrn(req, res, next)
  {
    var conditions = {
      receiver: req.body.receiver,
      supplier: req.body.supplier,
      docNo: typeof req.body.docNo === 'string' ? req.body.docNo.trim() : null
    };

    if (req.params.id)
    {
      conditions._id = {$ne: req.params.id};
    }

    Grn.findOne(conditions, {_id: 1}).lean().exec(function(err, grn)
    {
      if (err)
      {
        return next(err);
      }

      if (grn)
      {
        res.statusCode = 400;

        return next(new Error('docNo:duplicate'));
      }

      return next();
    });
  }

  function getGoodsFromGdnRoute(req, res, next)
  {
    var conditions = {
      docNo: req.query.docNo,
      receiver: req.query.receiver,
      supplier: req.query.supplier
    };

    Gdn.findOne(conditions, {goods: 1}, function(err, gdn)
    {
      if (err)
      {
        return next(err);
      }

      if (!gdn)
      {
        return res.send(404);
      }

      res.send(gdn.goods);
    });
  }
};