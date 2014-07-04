// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-paltrack project <http://lukasz.walukiewicz.eu/p/walkner-paltrack>

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
