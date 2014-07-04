// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-paltrack project <http://lukasz.walukiewicz.eu/p/walkner-paltrack>

'use strict';

var crud = require('../express/crud');

module.exports = function setUpPalletKindsRoutes(app, palletKindsModule)
{
  var express = app[palletKindsModule.config.expressId];
  var auth = app[palletKindsModule.config.userId].auth;
  var PalletKind = app[palletKindsModule.config.mongooseId].model('PalletKind');

  var canView = auth('DICTIONARIES:VIEW');
  var canManage = auth('DICTIONARIES:MANAGE');

  express.get('/palletKinds', canView, crud.browseRoute.bind(null, app, PalletKind));

  express.post('/palletKinds', canManage, crud.addRoute.bind(null, app, PalletKind));

  express.get('/palletKinds/:id', canView, crud.readRoute.bind(null, app, PalletKind));

  express.put('/palletKinds/:id', canManage, crud.editRoute.bind(null, app, PalletKind));

  express.del('/palletKinds/:id', canManage, crud.deleteRoute.bind(null, app, PalletKind));
};
