// Part of <https://miracle.systems/p/walkner-paltrack> licensed under <CC BY-NC-SA 4.0>

'use strict';

var crud = require('../express/crud');

module.exports = function setUpPartnersRoutes(app, partnersModule)
{
  var express = app[partnersModule.config.expressId];
  var auth = app[partnersModule.config.userId].auth;
  var Partner = app[partnersModule.config.mongooseId].model('Partner');

  var canView = auth('DICTIONARIES:VIEW');
  var canManage = auth('DICTIONARIES:MANAGE');

  express.get('/partners', canView, crud.browseRoute.bind(null, app, Partner));

  express.post(
    '/partners',
    auth('DICTIONARIES:MANAGE', 'REGISTRY:MANAGE'),
    crud.addRoute.bind(null, app, Partner)
  );

  express.get('/partners/:id', canView, crud.readRoute.bind(null, app, Partner));

  express.put('/partners/:id', canManage, crud.editRoute.bind(null, app, Partner));

  express.delete('/partners/:id', canManage, crud.deleteRoute.bind(null, app, Partner));
};
