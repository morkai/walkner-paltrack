// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-paltrack project <http://lukasz.walukiewicz.eu/p/walkner-paltrack>

define([
  'app/core/util/bindLoadingMessage',
  'app/core/pages/FilteredListPage',
  '../EventTypeCollection',
  '../views/EventListView',
  '../views/EventFilterView'
], function(
  bindLoadingMessage,
  FilteredListPage,
  EventTypeCollection,
  EventListView,
  EventFilterView
) {
  'use strict';

  return FilteredListPage.extend({

    ListView: EventListView,

    actions: null,

    defineModels: function()
    {
      FilteredListPage.prototype.defineModels.call(this);

      this.eventTypes = bindLoadingMessage(new EventTypeCollection(), this, 'MSG:LOADING_TYPES_FAILURE');
    },

    createFilterView: function()
    {
      return new EventFilterView({
        model: {
          rqlQuery: this.collection.rqlQuery,
          eventTypes: this.eventTypes
        }
      });
    },

    load: function(when)
    {
      return when(
        this.collection.fetch({reset: true}),
        this.eventTypes.fetch({reset: true})
      );
    }

  });
});
