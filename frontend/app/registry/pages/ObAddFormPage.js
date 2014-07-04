// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-paltrack project <http://lukasz.walukiewicz.eu/p/walkner-paltrack>

define([
  'app/i18n',
  'app/core/pages/AddFormPage',
  '../views/ObFormView'
], function(
  t,
  AddFormPage,
  ObFormView
) {
  'use strict';

  return AddFormPage.extend({

    FormView: ObFormView,

    breadcrumbs: function()
    {
      return [
        {
          label: t.bound('registry', 'BREADCRUMBS:ob:browse'),
          href: this.model.genClientUrl('base')
        },
        t.bound('registry', 'BREADCRUMBS:addForm')
      ];
    }

  });
});
