// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-paltrack project <http://lukasz.walukiewicz.eu/p/walkner-paltrack>

define([
  'app/i18n',
  'app/core/util/bindLoadingMessage',
  'app/core/pages/DetailsPage',
  '../views/ObDetailsView'
], function(
  t,
  bindLoadingMessage,
  DetailsPage,
  ObDetailsView
) {
  'use strict';

  return DetailsPage.extend({

    breadcrumbs: function()
    {
      return [
        {
          label: t.bound('registry', 'BREADCRUMBS:ob:browse'),
          href: this.model.genClientUrl('base')
        },
        this.model.getLabel()
      ];
    },

    initialize: function()
    {
      this.model = bindLoadingMessage(this.model, this);

      this.view = new ObDetailsView({model: this.model});
    },

    load: function(when)
    {
      return when(this.model.fetch());
    }

  });
});
