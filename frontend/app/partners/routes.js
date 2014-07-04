// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-paltrack project <http://lukasz.walukiewicz.eu/p/walkner-paltrack>

define([
  '../router',
  '../viewport',
  '../i18n',
  '../user',
  '../core/util/showDeleteFormPage',
  '../data/partners',
  './Partner',
  'i18n!app/nls/partners'
], function(
  router,
  viewport,
  t,
  user,
  showDeleteFormPage,
  partners,
  Partner
) {
  'use strict';

  var canView = user.auth('DICTIONARIES:VIEW');
  var canManage = user.auth('DICTIONARIES:MANAGE');

  router.map('/partners', canView, function()
  {
    viewport.loadPage(
      ['app/core/pages/ListPage', 'app/partners/views/PartnerListView'],
      function(ListPage, PartnerListView)
      {
        return new ListPage({
          ListView: PartnerListView,
          collection: partners
        });
      }
    );
  });

  router.map('/partners/:id', function(req)
  {
    viewport.loadPage(
      ['app/core/pages/DetailsPage', 'app/partners/templates/details'],
      function(DetailsPage, detailsTemplate)
      {
        return new DetailsPage({
          model: new Partner({_id: req.params.id}),
          detailsTemplate: detailsTemplate
        });
      }
    );
  });

  router.map('/partners;add', canManage, function()
  {
    viewport.loadPage(
      ['app/core/pages/AddFormPage', 'app/partners/views/PartnerFormView'],
      function(AddFormPage, PartnerFormView)
      {
        return new AddFormPage({
          FormView: PartnerFormView,
          model: new Partner()
        });
      }
    );
  });

  router.map('/partners/:id;edit', canManage, function(req)
  {
    viewport.loadPage(
      ['app/core/pages/EditFormPage', 'app/partners/views/PartnerFormView'],
      function(EditFormPage, PartnerFormView)
      {
        return new EditFormPage({
          FormView: PartnerFormView,
          model: new Partner({_id: req.params.id})
        });
      }
    );
  });

  router.map('/partners/:id;delete', canManage, showDeleteFormPage.bind(null, Partner));

});
