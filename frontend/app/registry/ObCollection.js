// Part of <https://miracle.systems/p/walkner-paltrack> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './Ob'
], function(
  Collection,
  Ob
) {
  'use strict';

  return Collection.extend({

    model: Ob,

    rqlQuery: function(rql)
    {
      return rql.Query.fromObject({
        limit: localStorage.OB_LIMIT || 25,
        sort: {
          date: -1
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
