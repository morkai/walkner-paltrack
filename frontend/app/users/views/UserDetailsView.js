// Part of <https://miracle.systems/p/walkner-paltrack> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/core/views/DetailsView',
  'app/users/templates/details'
], function(
  t,
  DetailsView,
  detailsTemplate
) {
  'use strict';

  return DetailsView.extend({

    template: detailsTemplate,

    localTopics: {
      'partners.synced': 'render'
    }

  });
});
