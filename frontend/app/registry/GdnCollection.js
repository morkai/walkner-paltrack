// Part of <https://miracle.systems/p/walkner-paltrack> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './Gdn'
], function(
  Collection,
  Gdn
) {
  'use strict';

  return Collection.extend({

    model: Gdn,

    rqlQuery: function(rql)
    {
      return rql.Query.fromObject({
        limit: localStorage.GDN_LIMIT || 25,
        sort: {
          date: -1,
          supplier: 1,
          receiver: 1
        }
      });
    },

    comparator: function(a, b)
    {
      return Date.parse(b.attributes.date) - Date.parse(a.attributes.date);
    },

    /**
     * @todo
     * @param {object} attrs
     * @returns {boolean}
     */
    hasOrMatches: function()
    {
      return true;
    }

  });
});
