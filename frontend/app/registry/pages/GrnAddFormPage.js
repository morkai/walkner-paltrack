// Part of <https://miracle.systems/p/walkner-paltrack> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/core/pages/AddFormPage',
  '../views/GrnFormView'
], function(
  t,
  AddFormPage,
  GrnFormView
) {
  'use strict';

  return AddFormPage.extend({

    FormView: GrnFormView,

    breadcrumbs: function()
    {
      return [
        {
          label: t.bound('registry', 'BREADCRUMBS:grn:browse'),
          href: this.model.genClientUrl('base')
        },
        t.bound('registry', 'BREADCRUMBS:addForm')
      ];
    }

  });
});
