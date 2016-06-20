// Part of <https://miracle.systems/p/walkner-paltrack> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'js2form',
  'app/i18n',
  'app/user',
  'app/time',
  'app/core/views/FilterView',
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
  FilterView,
  idAndLabel,
  prepareDateRange,
  partners,
  filterTemplate
) {
  'use strict';

  return FilterView.extend({

    template: filterTemplate,

    events: _.extend({}, FilterView.prototype.events, {
      'click a[data-range]': function(e)
      {
        var dateRange = prepareDateRange(e.target.getAttribute('data-range'), false);

        this.$id('from').val(dateRange.fromMoment.format('YYYY-MM-DD'));
        this.$id('to').val(dateRange.toMoment.format('YYYY-MM-DD'));
      }
    }),

    defaultFormData: {
      partner: '',
      from: '',
      to: ''
    },

    termToForm: {
      'partner': function(propertyName, term, formData)
      {
        formData[propertyName] = term.args[1];
      },
      'date': function(propertyName, term, formData)
      {
        var value = time.format(term.args[1], 'YYYY-MM-DD');

        if (term.name === 'lt')
        {
          formData.to = value;
        }
        else if (term.name === 'ge')
        {
          formData.from = value;
        }
      }
    },

    initialize: function()
    {
      FilterView.prototype.initialize.apply(this, arguments);

      this.on('filterChanged', this.onFilterChanged);
    },

    afterRender: function()
    {
      FilterView.prototype.afterRender.call(this);

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

    serializeFormToQuery: function(selector)
    {
      var partner = this.$id('partner').val();
      var fromMoment = time.getMoment(this.$id('from').val(), 'YYYY-MM-DD');
      var toMoment = time.getMoment(this.$id('to').val(), 'YYYY-MM-DD');

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
    },

    onFilterChanged: function(rqlQuery)
    {
      localStorage.OB_LIMIT = rqlQuery.limit;
    }

  });
});
