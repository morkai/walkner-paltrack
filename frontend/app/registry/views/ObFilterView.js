// Part of <https://miracle.systems/p/walkner-paltrack> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'js2form',
  'app/i18n',
  'app/user',
  'app/time',
  'app/core/views/FilterView',
  'app/core/util/idAndLabel',
  'app/core/util/forms/dateTimeRange',
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
  dateTimeRange,
  partners,
  filterTemplate
) {
  'use strict';

  return FilterView.extend({

    template: filterTemplate,

    events: _.assign({

      'click a[data-date-time-range]': dateTimeRange.handleRangeEvent

    }, FilterView.prototype.events),

    defaultFormData: {
      partner: ''
    },

    termToForm: {
      'date': dateTimeRange.rqlToForm,
      'partner': function(propertyName, term, formData)
      {
        formData[propertyName] = term.args[1];
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
          width: '250px',
          placeholder: ' ',
          allowClear: true,
          data: partners.map(idAndLabel)
        });
      }
    },

    serializeFormToQuery: function(selector)
    {
      var partner = this.$id('partner').val();

      dateTimeRange.formToRql(this, selector);

      if (partner)
      {
        selector.push({name: 'eq', args: ['partner', partner]});
      }
    },

    onFilterChanged: function(rqlQuery)
    {
      localStorage.OB_LIMIT = rqlQuery.limit;
    }

  });
});
