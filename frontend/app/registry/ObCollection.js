// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-paltrack project <http://lukasz.walukiewicz.eu/p/walkner-paltrack>

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
