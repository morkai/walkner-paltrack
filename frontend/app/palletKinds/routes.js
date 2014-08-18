// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-paltrack project <http://lukasz.walukiewicz.eu/p/walkner-paltrack>

define([
  '../router',
  '../viewport',
  '../user',
  '../i18n',
  '../data/palletKinds',
  './PalletKind',
  '../core/pages/ListPage',
  '../core/pages/DetailsPage',
  '../core/pages/AddFormPage',
  '../core/pages/EditFormPage',
  '../core/pages/ActionFormPage',
  './views/decoratePalletKind',
  './views/PalletKindFormView',
  'app/palletKinds/templates/details',
  'i18n!app/nls/palletKinds'
], function(
  router,
  viewport,
  user,
  t,
  palletKinds,
  PalletKind,
  ListPage,
  DetailsPage,
  AddFormPage,
  EditFormPage,
  ActionFormPage,
  decoratePalletKind,
  PalletKindFormView,
  detailsTemplate
) {
  'use strict';

  var canView = user.auth('DICTIONARIES:VIEW');
  var canManage = user.auth('DICTIONARIES:MANAGE');

  router.map('/palletKinds', canView, function()
  {
    viewport.showPage(new ListPage({
      collection: palletKinds,
      columns: [
        'name',
        'no',
        'position'
      ],
      serializeRow: decoratePalletKind
    }));
  });

  router.map('/palletKinds/:id', function(req)
  {
    viewport.showPage(new DetailsPage({
      model: new PalletKind({_id: req.params.id}),
      detailsTemplate: detailsTemplate,
      serializeDetails: decoratePalletKind
    }));
  });

  router.map('/palletKinds;add', canManage, function()
  {
    viewport.showPage(new AddFormPage({
      FormView: PalletKindFormView,
      model: new PalletKind()
    }));
  });

  router.map('/palletKinds/:id;edit', canManage, function(req)
  {
    viewport.showPage(new EditFormPage({
      FormView: PalletKindFormView,
      model: new PalletKind({_id: req.params.id})
    }));
  });

  router.map('/palletKinds/:id;delete', canManage, function(req, referer)
  {
    var model = new PalletKind({_id: req.params.id});

    viewport.showPage(new ActionFormPage({
      model: model,
      actionKey: 'delete',
      successUrl: model.genClientUrl('base'),
      cancelUrl: referer || model.genClientUrl('base'),
      formMethod: 'DELETE',
      formAction: model.url(),
      formActionSeverity: 'danger'
    }));
  });

});