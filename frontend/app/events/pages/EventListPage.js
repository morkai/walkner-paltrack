// Part of <https://miracle.systems/p/walkner-paltrack> licensed under <CC BY-NC-SA 4.0>

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
