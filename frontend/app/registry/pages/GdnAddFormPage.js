// Part of <https://miracle.systems/p/walkner-paltrack> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/core/pages/AddFormPage',
  '../views/GdnFormView'
], function(
  t,
  AddFormPage,
  GdnFormView
) {
  'use strict';

  return AddFormPage.extend({

    FormView: GdnFormView,

    breadcrumbs: function()
    {
      return [
        {
          label: t.bound('registry', 'BREADCRUMB:gdn:browse'),
          href: this.model.genClientUrl('base')
        },
        t.bound('registry', 'BREADCRUMB:addForm')
      ];
    }

  });
});
