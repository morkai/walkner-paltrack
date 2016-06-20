// Part of <https://miracle.systems/p/walkner-paltrack> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/core/pages/EditFormPage',
  '../views/GrnFormView'
], function(
  t,
  EditFormPage,
  GrnFormView
) {
  'use strict';

  return EditFormPage.extend({

    FormView: GrnFormView,

    breadcrumbs: function()
    {
      return [
        {
          label: t.bound('registry', 'BREADCRUMBS:grn:browse'),
          href: this.model.genClientUrl('base')
        },
        {
          label: this.model.getLabel(),
          href: this.model.genClientUrl()
        },
        t.bound('registry', 'BREADCRUMBS:editForm')
      ];
    }

  });
});
