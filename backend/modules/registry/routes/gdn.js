// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-paltrack project <http://lukasz.walukiewicz.eu/p/walkner-paltrack>

'use strict';

var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;
var lodash = require('lodash');
var moment = require('moment');
var limitToPartner = require('./limitToPartner');
var recordChanges = require('./recordChanges');
var checkGnRoute = require('./checkGnRoute');

module.exports = function setUpGdnRoutes(app, registryModule)
{
  var express = app[registryModule.config.expressId];
  var userModule = app[registryModule.config.userId];
  var partnersModule = app[registryModule.config.partnersId];
  var palletKindsModule =  app[registryModule.config.palletKindsId];
  var Gdn = app[registryModule.config.mongooseId].model('Gdn');

  var canView = userModule.auth('REGISTRY:VIEW');
  var canManage = userModule.auth('REGISTRY:MANAGE');

  express.get(
    '/registry/gdn',
    canView,
    limitToPartner.bind(null, 'supplier'),
    express.crud.browseRoute.bind(null, app, Gdn)
  );

  express.post(
    '/registry/gdn',
    canManage,
    prepareNewGdnModel,
    express.crud.addRoute.bind(null, app, Gdn)
  );

  express.get('/registry/gdn/:id;print', canPrint, printRoute);

  express.get('/registry/gdn/:id;print-footer', canPrint, printFooterRoute);

  express.get('/registry/gdn/:id', canView, express.crud.readRoute.bind(null, app, Gdn));

  express.post(
    '/registry/gdn/:id;check',
    userModule.auth('REGISTRY:CHECK'),
    checkGnRoute.bind(null, app, registryModule, Gdn)
  );

  express.put(
    '/registry/gdn/:id',
    canManage,
    prepareExistingGdnModel,
    express.crud.editRoute.bind(null, app, Gdn)
  );

  express.del('/registry/gdn/:id', canManage, express.crud.deleteRoute.bind(null, app, Gdn));

  function prepareNewGdnModel(req, res, next)
  {
    if (req.session.user.partner && req.body.supplier !== req.session.user.partner)
    {
      res.statusCode = 400;

      return next(new Error('supplier:privilege'));
    }

    Gdn
      .findOne({supplier: req.body.supplier}, {docNo: 1})
      .sort({docNo: -1})
      .lean()
      .exec(function(err, lastGdn)
      {
        if (err)
        {
          return next(err);
        }

        req.model = new Gdn({
          supplier: req.body.supplier,
          receiver: req.body.receiver,
          date: req.body.date + ' 00:00:00',
          docNo: (lastGdn ? lastGdn.docNo : 0) + 1,
          goods: req.body.goods,
          printed: false,
          createdAt: new Date(),
          creator: userModule.createUserInfo(req.session.user, req),
          updatedAt: null,
          updater: null,
          changes: []
        });

        next();
      });
  }

  function prepareExistingGdnModel(req, res, next)
  {
    if (req.session.user.partner && req.body.supplier !== req.session.user.partner)
    {
      res.statusCode = 400;

      return next(new Error('supplier:privilege'));
    }

    Gdn.findById(req.params.id, function(err, gdn)
    {
      if (err)
      {
        return next(err);
      }

      req.model = gdn;

      if (!gdn)
      {
        return next();
      }

      var changeCount = recordChanges(
        gdn,
        lodash.pick(req.body, ['date', 'goods']),
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

  function canPrint(req, res, next)
  {
    req.wkhtmltopdf = req.headers['user-agent']
      && req.headers['user-agent'].indexOf('wkhtmltopdf') !== -1;

    if (!req.wkhtmltopdf)
    {
      return canView(req, res, next);
    }

    next();
  }

  function printRoute(req, res, next)
  {
    Gdn.findById(req.params.id).exec(function(err, gdn)
    {
      if (err)
      {
        return next(err);
      }

      if (!gdn)
      {
        return res.send(404);
      }

      if (req.wkhtmltopdf)
      {
        return renderPrintableGdn(gdn, res, next);
      }

      var pdfFile = path.join(registryModule.config.gdnStoragePath, gdn._id.toString() + '.pdf');

      fs.exists(pdfFile, function(exists)
      {
        if (!exists)
        {
          return generatePdf(pdfFile, gdn, res, next);
        }

        res.sendfile(pdfFile);
      });
    });
  }

  function printFooterRoute(req, res, next)
  {
    Gdn.findById(req.params.id, {goods: 0}).lean().exec(function(err, gdn)
    {
      if (err)
      {
        return next(next);
      }

      res.render('gdnFooter', {
        docNo: gdn.docNo,
        createdAt: moment(gdn.createdAt).format('YYYY-MM-DD HH:mm:ss'),
        creator: gdn.creator.label
      });
    });
  }

  function renderPrintableGdn(gdn, res)
  {
    var supplier = partnersModule.modelsById[gdn.supplier] || {};
    var receiver = partnersModule.modelsById[gdn.receiver] || {};
    var goods = [];
    var total = 0;

    Object.keys(gdn.goods).forEach(function(palletKindId, i)
    {
      var palletKind = palletKindsModule.modelsById[palletKindId] || {};

      goods.push({
        no: i + 1,
        number: palletKind.no || '',
        name: palletKind.description || palletKind.name || palletKindId,
        count: gdn.goods[palletKindId]
      });

      total += gdn.goods[palletKindId];
    });

    res.render('gdn', {
      docNo: gdn.docNo,
      supplier: supplier.address || supplier.name,
      receiver: receiver.address || receiver.name,
      sendDate: moment(gdn.date).format('YYYY-MM-DD'),
      goods: goods,
      total: total
    });
  }

  function generatePdf(outputFile, gdn, res, next)
  {
    var baseUrl = registryModule.config.wkhtmltopdfUrl + 'registry/gdn/' + gdn._id;
    var cmd = '"' + registryModule.config.wkhtmltopdfCmd + '"'
      + ' -q '
      + ' -s A4'
      + ' -B 15mm -L 10mm -R 10mm -T 10mm'
      + ' -O Portrait'
      + ' --dpi 120'
      + ' --disable-smart-shrinking'
      + ' --footer-html "' + baseUrl + ';print-footer"'
      + ' "' + baseUrl + ';print"'
      + ' "' + outputFile + '"';

    exec(cmd, function(err, stdout, stderr)
    {
      if (err)
      {
        fs.unlink(outputFile);

        return next(new Error(
          "Failed to generate PDF for GDN [" + gdn._id + "]: " + err.message
            + "\nSTDOUT:\n" + stdout
            + "\nSTDERR:\n" + stderr
        ));
      }

      res.sendfile(outputFile);

      gdn.printedAt = new Date();
      gdn.save(function(err)
      {
        if (err)
        {
          registryModule.error("Failed to save GDN after printing: %s", err.message);
        }
        else
        {
          app.broker.publish('registry.gdn.printed.' + gdn.supplier + '.' + gdn._id, {
            _id: gdn._id,
            supplier: gdn.supplier,
            printedAt: gdn.printedAt
          });
        }
      });
    });
  }
};
