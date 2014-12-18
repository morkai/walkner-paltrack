// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-paltrack project <http://lukasz.walukiewicz.eu/p/walkner-paltrack>

'use strict';

var lodash = require('lodash');
var step = require('h5.step');
var moment = require('moment');
var mongoSerializer = require('h5.rql/lib/serializers/mongoSerializer');
var limitToPartner = require('./limitToPartner');
var recordChanges = require('./recordChanges');
var checkGnRoute = require('./checkGnRoute');

module.exports = function setUpGrnRoutes(app, registryModule)
{
  var express = app[registryModule.config.expressId];
  var userModule = app[registryModule.config.userId];
  var mongoose = app[registryModule.config.mongooseId];
  var Grn = mongoose.model('Grn');
  var Gdn = mongoose.model('Gdn');
  var Partner = mongoose.model('Partner');
  var PalletKind = mongoose.model('PalletKind');

  var canView = userModule.auth('REGISTRY:VIEW');
  var canManage = userModule.auth('REGISTRY:MANAGE');

  express.get(
    '/registry/grn',
    canView,
    limitToPartner.bind(null, 'receiver'),
    express.crud.browseRoute.bind(null, app, Grn)
  );

  express.get(
    '/registry/grn;print',
    canView,
    limitToPartner.bind(null, 'receiver'),
    printGrnListRoute
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

  express.delete('/registry/grn/:id', canManage, express.crud.deleteRoute.bind(null, app, Grn));

  function prepareNewGrnModel(req, res, next)
  {
    var body = req.body;

    if (req.session.user.partner && body.receiver !== req.session.user.partner)
    {
      res.statusCode = 400;

      return next(new Error('receiver:privilege'));
    }

    req.model = new Grn({
      receiver: body.receiver,
      supplier: body.supplier,
      date: body.date + ' 00:00:00',
      docNo: body.docNo,
      goods: body.goods,
      createdAt: new Date(),
      creator: userModule.createUserInfo(req.session.user, req),
      updatedAt: null,
      updater: null,
      changes: [],
      checked: false,
      checkedAt: null,
      checker: null
    });

    req.model.checkGdn(next);
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

      req.model.checkGdn(next);
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

  function printGrnListRoute(req, res, next)
  {
    var conditions = mongoSerializer.fromQuery(req.rql).selector;
    var receiver = conditions.receiver;
    var supplier = conditions.supplier;

    if (!receiver && !supplier)
    {
      return res.json(new Error('INVALID_PARTNER'), 400);
    }

    if (!conditions.date || !conditions.date.$gte || !conditions.date.$lt)
    {
      return res.json(new Error('INVALID_DATE'), 400);
    }

    step(
      function findGrnsStep()
      {
        this.partnersNotes = {};

        var fields = {
          receiver: 1,
          supplier: 1,
          date: 1,
          docNo: 1,
          goods: 1
        };

        var stream = Grn.find(conditions, fields).lean().stream();
        var next = this.next();

        stream.on('end', next);
        stream.on('error', next);
        stream.on('data', handleGrnForPrint.bind(null, this.partnersNotes, !!receiver));
      },
      function findPartnersAndPalletKindsStep(err)
      {
        if (err)
        {
          return this.skip(err);
        }

        var partnerIds = Object.keys(this.partnersNotes);

        if (receiver && partnerIds.indexOf(receiver) === -1)
        {
          partnerIds.push(receiver);
        }

        if (supplier && partnerIds.indexOf(supplier) === -1)
        {
          partnerIds.push(supplier);
        }

        Partner.find({_id: {$in: partnerIds}}, {name: 1, clientNo: 1}).lean().exec(this.parallel());
        PalletKind.find({}, {name: 1}).sort({position: 1}).lean().exec(this.parallel());
      },
      function preparePartnersAndPalletKindsStep(err, partners, palletKinds)
      {
        if (err)
        {
          return this.skip(err);
        }

        this.partners = {};

        lodash.forEach(partners, function(partner)
        {
          this.partners[partner._id] = partner;

          partner._id = undefined;
        }, this);

        this.palletKinds = {};

        lodash.forEach(palletKinds, function(palletKind)
        {
          this.palletKinds[palletKind._id] = palletKind.name;
        }, this);
      },
      function sendResultsStep(err)
      {
        if (err)
        {
          return next(err);
        }

        var partners = this.partners;
        var partnersNotes = [];

        lodash.forEach(this.partnersNotes, function(partnerNotes, partner)
        {
          partnersNotes.push({
            partner: formatPartner(partners[partner]),
            totals: partnerNotes.totals,
            notes: partnerNotes.notes.reverse()
          });
        });

        res.render('../modules/registry/templates/grnList.ejs', {
          from: moment(conditions.date.$gte).format('DD.MM.YYYY'),
          to: moment(conditions.date.$lt).subtract(1, 'days').format('DD.MM.YYYY'),
          receiver: formatPartner(partners[receiver]),
          supplier: formatPartner(partners[supplier]),
          palletKinds: lodash.map(this.palletKinds, function(v, k) { return {_id: k, name: v}; }),
          partnersNotes: partnersNotes
        });
      }
    );
  }

  function formatPartner(partner)
  {
    return partner ? (partner.name + (partner.clientNo ? (' (' + partner.clientNo + ')') : '')) : null;
  }

  function handleGrnForPrint(partnersNotes, hasReceiver, grn)
  {
    var partnerId = grn[hasReceiver ? 'supplier' : 'receiver'].toString();

    if (partnersNotes[partnerId] === undefined)
    {
      partnersNotes[partnerId] = {
        totals: {},
        notes: []
      };
    }

    var partnerNotes = partnersNotes[partnerId];

    lodash.forEach(grn.goods, function(count, palletKind)
    {
      if (partnerNotes.totals[palletKind] === undefined)
      {
        partnerNotes.totals[palletKind] = count;
      }
      else
      {
        partnerNotes.totals[palletKind] += count;
      }
    });

    partnerNotes.notes.push({
      date: moment(grn.date).format('DD.MM.YYYY'),
      docNo: grn.docNo,
      goods: grn.goods
    });
  }
};
