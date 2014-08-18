// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-paltrack project <http://lukasz.walukiewicz.eu/p/walkner-paltrack>

define([
  'app/i18n',
  'app/core/util/bindLoadingMessage',
  'app/core/util/pageActions',
  'app/core/pages/DetailsPage',
  '../views/GrnDetailsView'
], function(
  t,
  bindLoadingMessage,
  pageActions,
  DetailsPage,
  GrnDetailsView
) {
  'use strict';

  return DetailsPage.extend({

    breadcrumbs: function()
    {
      return [
        {
          label: t.bound('registry', 'BREADCRUMBS:grn:browse'),
          href: this.model.genClientUrl('base')
        },
        this.model.getLabel()
      ];
    },

    actions: function()
    {
      var actions = [];

      if (!this.model.get('checked'))
      {
        actions.push(
          pageActions.edit(this.model, 'REGISTRY:MANAGE'),
          pageActions.delete(this.model, 'REGISTRY:MANAGE')
        );
      }

      return actions;
    },

    initialize: function()
    {
      this.model = bindLoadingMessage(this.model, this);

      this.view = new GrnDetailsView({model: this.model});

      this.listenTo(this.model, 'change:checked', this.onGdnChecked);
    },

    load: function(when)
    {
      return when(this.model.fetch());
    },

    onGdnChecked: function()
    {
      if (this.layout)
      {
        this.layout.setActions(this.actions, this);
      }
    }

  });
});
