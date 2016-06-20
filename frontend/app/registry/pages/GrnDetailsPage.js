// Part of <https://miracle.systems/p/walkner-paltrack> licensed under <CC BY-NC-SA 4.0>

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
