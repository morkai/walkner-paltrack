// Part of <https://miracle.systems/p/walkner-paltrack> licensed under <CC BY-NC-SA 4.0>

'use strict';

var _ = require('lodash');
var limitToPartner = require('./limitToPartner');
var recordChanges = require('./recordChanges');

module.exports = function setUpObRoutes(app, registryModule)
{
  var express = app[registryModule.config.expressId];
  var userModule = app[registryModule.config.userId];
  var Ob = app[registryModule.config.mongooseId].model('Ob');

  var canView = userModule.auth('REGISTRY:VIEW');
  var canManage = userModule.auth('REGISTRY:MANAGE');

  express.get(
    '/registry/ob',
    canView,
    limitToPartner.bind(null, 'partner'),
    express.crud.browseRoute.bind(null, app, Ob)
  );

  express.post(
    '/registry/ob',
    canManage,
    checkForDuplicateOb,
    prepareNewObModel,
    express.crud.addRoute.bind(null, app, Ob)
  );

  express.get('/registry/ob/:id', canView, express.crud.readRoute.bind(null, app, Ob));

  express.put(
    '/registry/ob/:id',
    canManage,
    checkForDuplicateOb,
    prepareExistingObModel,
    express.crud.editRoute.bind(null, app, Ob)
  );

  express.delete('/registry/ob/:id', canManage, express.crud.deleteRoute.bind(null, app, Ob));

  function prepareNewObModel(req, res, next)
  {
    if (req.session.user.partner && req.body.partner !== req.session.user.partner)
    {
      res.statusCode = 400;

      return next(new Error('receiver:privilege'));
    }

    req.model = new Ob({
      partner: req.body.partner,
      date: req.body.date + ' 00:00:00',
      goods: req.body.goods,
      createdAt: new Date(),
      creator: userModule.createUserInfo(req.session.user, req),
      updatedAt: null,
      updater: null,
      changes: []
    });

    next();
  }

  function prepareExistingObModel(req, res, next)
  {
    if (req.session.user.partner && req.body.partner !== req.session.user.partner)
    {
      res.statusCode = 400;

      return next(new Error('receiver:privilege'));
    }

    Ob.findById(req.params.id, function(err, ob)
    {
      if (err)
      {
        return next(err);
      }

      req.model = ob;

      if (!ob)
      {
        return next();
      }

      var changeCount = recordChanges(
        ob,
        _.pick(req.body, ['goods']),
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

  function checkForDuplicateOb(req, res, next)
  {
    var conditions = {
      partner: req.body.partner,
      date: req.body.date + (req.body.date.indexOf('T') === -1 ? ' 00:00:00' : '')
    };

    if (req.params.id)
    {
      conditions._id = {$ne: req.params.id};
    }

    Ob.findOne(conditions, {_id: 1}).lean().exec(function(err, ob)
    {
      if (err)
      {
        return next(err);
      }

      if (ob)
      {
        res.statusCode = 400;

        return next(new Error('date:duplicate'));
      }

      return next();
    });
  }
};
