// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-paltrack project <http://lukasz.walukiewicz.eu/p/walkner-paltrack>

define([
  '../router',
  '../viewport',
  '../user',
  '../core/util/showDeleteFormPage',
  './Grn',
  './pages/GrnListPage',
  './pages/GrnAddFormPage',
  './pages/GrnDetailsPage',
  './pages/GrnEditFormPage',
  './Gdn',
  './pages/GdnListPage',
  './pages/GdnAddFormPage',
  './pages/GdnDetailsPage',
  './pages/GdnEditFormPage',
  './Ob',
  './pages/ObListPage',
  './pages/ObAddFormPage',
  './pages/ObDetailsPage',
  './pages/ObEditFormPage',
  'i18n!app/nls/registry'
], function(
  router,
  viewport,
  user,
  showDeleteFormPage,
  Grn,
  GrnListPage,
  GrnAddFormPage,
  GrnDetailsPage,
  GrnEditFormPage,
  Gdn,
  GdnListPage,
  GdnAddFormPage,
  GdnDetailsPage,
  GdnEditFormPage,
  Ob,
  ObListPage,
  ObAddFormPage,
  ObDetailsPage,
  ObEditFormPage
) {
  'use strict';

  var canView = user.auth('REGISTRY:VIEW');
  var canManage = user.auth('REGISTRY:MANAGE');

  router.map('/registry/grn', canView, function(req)
  {
    viewport.showPage(new GrnListPage({rql: req.rql}));
  });

  router.map('/registry/grn;add', canManage, function()
  {
    viewport.showPage(new GrnAddFormPage({model: new Grn()}));
  });

  router.map('/registry/grn/:id', function(req)
  {
    viewport.showPage(new GrnDetailsPage({model: new Grn({_id: req.params.id})}));
  });

  router.map('/registry/grn/:id;edit', function(req)
  {
    viewport.showPage(new GrnEditFormPage({model: new Grn({_id: req.params.id})}));
  });

  router.map('/registry/grn/:id;delete', canManage, showDeleteFormPage.bind(null, {
    Model: Grn,
    breadcrumbsBrowseKey: 'BREADCRUMBS:grn:browse'
  }));

  router.map('/registry/gdn', canView, function(req)
  {
    viewport.showPage(new GdnListPage({rql: req.rql}));
  });

  router.map('/registry/gdn;add', canManage, function()
  {
    viewport.showPage(new GdnAddFormPage({model: new Gdn()}));
  });

  router.map('/registry/gdn/:id', function(req)
  {
    viewport.showPage(new GdnDetailsPage({model: new Gdn({_id: req.params.id})}));
  });

  router.map('/registry/gdn/:id;edit', function(req)
  {
    viewport.showPage(new GdnEditFormPage({model: new Gdn({_id: req.params.id})}));
  });

  router.map('/registry/gdn/:id;delete', canManage, showDeleteFormPage.bind(null, {
    Model: Gdn,
    breadcrumbsBrowseKey: 'BREADCRUMBS:gdn:browse'
  }));

  router.map('/registry/ob', canView, function(req)
  {
    viewport.showPage(new ObListPage({rql: req.rql}));
  });

  router.map('/registry/ob;add', canManage, function()
  {
    viewport.showPage(new ObAddFormPage({model: new Ob()}));
  });

  router.map('/registry/ob/:id', function(req)
  {
    viewport.showPage(new ObDetailsPage({model: new Ob({_id: req.params.id})}));
  });

  router.map('/registry/ob/:id;edit', function(req)
  {
    viewport.showPage(new ObEditFormPage({model: new Ob({_id: req.params.id})}));
  });

  router.map('/registry/ob/:id;delete', canManage, showDeleteFormPage.bind(null, {
    Model: Ob,
    breadcrumbsBrowseKey: 'BREADCRUMBS:ob:browse'
  }));
});
