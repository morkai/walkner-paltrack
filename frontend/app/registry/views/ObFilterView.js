// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-paltrack project <http://lukasz.walukiewicz.eu/p/walkner-paltrack>

define([
  'underscore',
  'js2form',
  'app/i18n',
  'app/user',
  'app/time',
  'app/core/Model',
  'app/core/View',
  'app/core/util/idAndLabel',
  'app/core/util/prepareDateRange',
  'app/data/partners',
  'app/registry/templates/obFilter'
], function(
  _,
  js2form,
  t,
  user,
  time,
  Model,
  View,
  idAndLabel,
  prepareDateRange,
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
      },
      'click a[data-range]': function(e)
      {
        var dateRange = prepareDateRange(e.target.getAttribute('data-range'), false);

        this.$id('from').val(dateRange.fromMoment.format('YYYY-MM-DD'));
        this.$id('to').val(dateRange.toMoment.format('YYYY-MM-DD'));
      }
    },

    initialize: function()
    {
      this.idPrefix = _.uniqueId();
    },

    destroy: function()
    {
      this.$('.select2-offscreen[tabindex="-1"]').select2('destroy');
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

      if (!user.data.partner)
      {
        this.$id('partner').select2({
          width: '150px',
          placeholder: ' ',
          allowClear: true,
          data: partners.map(idAndLabel)
        });
      }
    },

    serializeRqlQuery: function()
    {
      var rqlQuery = this.model.rqlQuery;
      var formData = {
        partner: '',
        from: '',
        to: '',
        limit: rqlQuery.limit < 5 ? 5 : (rqlQuery.limit > 100 ? 100 : rqlQuery.limit)
      };

      rqlQuery.selector.args.forEach(function(term)
      {
        /*jshint -W015*/

        if (term.name !== 'eq' && term.name !== 'lt' && term.name !== 'ge')
        {
          return;
        }

        var property = term.args[0];

        switch (property)
        {
          case 'partner':
            formData[property] = term.args[1];
            break;

          case 'date':
            var value = time.format(term.args[1], 'YYYY-MM-DD');

            if (term.name === 'lt')
            {
              formData.to = value;
            }
            else if (term.name === 'ge')
            {
              formData.from = value;
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
      var fromMoment = time.getMoment(this.$id('from').val());
      var toMoment = time.getMoment(this.$id('to').val());

      if (partner)
      {
        selector.push({name: 'eq', args: ['partner', partner]});
      }

      if (fromMoment.isValid() && toMoment.isValid() && fromMoment.valueOf() === toMoment.valueOf())
      {
        toMoment.add(1, 'days');

        this.$id('to').val(toMoment.format('YYYY-MM-DD'));
      }

      if (fromMoment.isValid())
      {
        selector.push({name: 'ge', args: ['date', fromMoment.valueOf()]});
      }

      if (toMoment.isValid())
      {
        selector.push({name: 'lt', args: ['date', toMoment.valueOf()]});
      }

      rqlQuery.selector = {name: 'and', args: selector};
      rqlQuery.limit = parseInt(this.$id('limit').val(), 10) || 15;
      rqlQuery.skip = 0;

      localStorage.OB_LIMIT = rqlQuery.limit;

      this.trigger('filterChanged', rqlQuery);
    }

  });
});
