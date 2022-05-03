// Part of <https://miracle.systems/p/walkner-paltrack> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'app/i18n',
  'app/user',
  'app/core/util/bindLoadingMessage',
  'app/core/util/pageActions',
  'app/core/pages/DetailsPage',
  '../views/GdnDetailsView'
], function(
  $,
  t,
  user,
  bindLoadingMessage,
  pageActions,
  DetailsPage,
  GdnDetailsView
) {
  'use strict';

  return DetailsPage.extend({

    breadcrumbs: function()
    {
      return [
        {
          label: t.bound('registry', 'BREADCRUMB:gdn:browse'),
          href: this.model.genClientUrl('base')
        },
        this.model.getLabel()
      ];
    },

    actions: function()
    {
      var page = this;
      var actions = [{
        icon: 'print',
        label: t('registry', 'PAGE_ACTION:print'),
        callback: function()
        {
          window.open(page.model.url() + ';print');
        }
      }];

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

      this.view = new GdnDetailsView({model: this.model});

      this.listenTo(this.model, 'change:checked', this.onGdnChecked);
    },

    setUpLayout: function(layout)
    {
      this.layout = layout;
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
