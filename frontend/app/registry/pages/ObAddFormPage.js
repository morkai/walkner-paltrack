// Part of <https://miracle.systems/p/walkner-paltrack> licensed under <CC BY-NC-SA 4.0>

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
          label: t.bound('registry', 'BREADCRUMB:ob:browse'),
          href: this.model.genClientUrl('base')
        },
        t.bound('registry', 'BREADCRUMB:addForm')
      ];
    }

  });
});
