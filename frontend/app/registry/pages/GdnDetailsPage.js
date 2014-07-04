// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-paltrack project <http://lukasz.walukiewicz.eu/p/walkner-paltrack>

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
          label: t.bound('registry', 'BREADCRUMBS:gdn:browse'),
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
        label: t('registry', 'LIST:ACTION:print'),
        callback: function()
        {
          window.open(page.model.url() + ';print');
        }
      }];

      if (!this.model.get('printedAt'))
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

      this.listenToOnce(this.model, 'sync', this.onModelSync);
    },

    setUpLayout: function(layout)
    {
      this.layout = layout;
    },

    load: function(when)
    {
      return when(this.model.fetch());
    },

    onModelSync: function()
    {
      if (this.model.get('printedAt'))
      {
        return;
      }

      var printedTopic = 'registry.gdn.printed.' + this.model.get('supplier') + '.' + this.model.id;

      this.pubsub.subscribe(printedTopic, this.onGdnPrinted.bind(this));
    },

    onGdnPrinted: function(message)
    {
      this.model.set('printedAt', message.printedAt);

      if (this.layout)
      {
        this.layout.setActions(this.actions, this);
      }
    }

  });
});
