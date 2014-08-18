// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-paltrack project <http://lukasz.walukiewicz.eu/p/walkner-paltrack>

'use strict';

var crypto = require('crypto');
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
    var body = req.body;

    if (req.session.user.partner && body.supplier !== req.session.user.partner)
    {
      res.statusCode = 400;

      return next(new Error('supplier:privilege'));
    }

    req.model = new Gdn({
      supplier: body.supplier,
      receiver: body.receiver,
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

    next();
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
    Gdn.findById(req.params.id, {changes: 0}).lean().exec(function(err, gdn)
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
        return renderPrintableGdn(gdn, res);
      }

      var fileNameHash = crypto.createHash('md5')
        .update(gdn._id.toString())
        .update(Date.now().toString())
        .update(Math.random().toString())
        .digest('hex');

      var pdfFile = path.join(registryModule.config.gdnStoragePath, fileNameHash + '.pdf');

      return generatePdf(pdfFile, gdn, res, next);
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

      res.sendfile(outputFile, function(err)
      {
        if (!res.headersSent)
        {
          next(err);
        }

        fs.unlink(outputFile);
      });
    });
  }
};
