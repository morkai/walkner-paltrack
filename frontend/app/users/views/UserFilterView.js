// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-paltrack project <http://lukasz.walukiewicz.eu/p/walkner-paltrack>

define([
  'underscore',
  'js2form',
  'app/i18n',
  'app/core/View',
  'app/data/partners',
  'app/users/templates/filter',
  'select2'
], function(
  _,
  js2form,
  t,
  View,
  partners,
  filterTemplate
) {
  'use strict';

  return View.extend({

    template: filterTemplate,

    events: {
      'submit .filter-form': function(e)
      {
        e.preventDefault();

        this.changeFilter();
      }
    },

    initialize: function()
    {
      this.idPrefix = _.uniqueId('userFilter');
    },

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix
      };
    },

    afterRender: function()
    {
      var formData = this.serializeRqlQuery();

      js2form(this.el.querySelector('.filter-form'), formData);

      this.$id('partner').select2({
        width: 'resolve',
        allowClear: true,
        data: partners.map(function(partner)
        {
          return {
            id: partner.id,
            text: partner.getLabel()
          };
        })
      });
    },

    serializeRqlQuery: function()
    {
      var rqlQuery = this.model.rqlQuery;
      var formData = {
        partner: '',
        lastName: '',
        limit: rqlQuery.limit < 5 ? 5 : (rqlQuery.limit > 100 ? 100 : rqlQuery.limit)
      };

      rqlQuery.selector.args.forEach(function(term)
      {
        /*jshint -W015*/

        var property = term.args[0];

        switch (property)
        {
          case 'partner':
            formData[property] = term.args[1];
            break;

          case 'lastName':
            if (term.name === 'regex')
            {
              formData[property] = term.args[1].replace('^', '');
            }
            break;
        }
      });

      return formData;
    },

    changeFilter: function()
    {
      var rqlQuery = this.model.rqlQuery;
      var selector = [];
      var partner = this.$id('partner').val();
      var lastName = this.$id('lastName').val().trim();

      if (partner.length)
      {
        selector.push({name: 'eq', args: ['partner', partner]});
      }

      if (lastName.length)
      {
        selector.push({name: 'regex', args: ['lastName', '^' + lastName, 'i']});
      }

      rqlQuery.selector = {name: 'and', args: selector};
      rqlQuery.limit = parseInt(this.$id('limit').val(), 10) || 15;
      rqlQuery.skip = 0;

      this.trigger('filterChanged', rqlQuery);
    }

  });
});
