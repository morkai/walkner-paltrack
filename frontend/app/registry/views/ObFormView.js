// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-paltrack project <http://lukasz.walukiewicz.eu/p/walkner-paltrack>

define([
  'underscore',
  'app/i18n',
  'app/time',
  'app/user',
  'app/viewport',
  'app/data/partners',
  'app/data/palletKinds',
  'app/core/util/idAndLabel',
  'app/core/views/FormView',
  '../util/showAddPartnerForm',
  'app/registry/templates/obForm'
], function(
  _,
  t,
  time,
  user,
  viewport,
  partners,
  palletKinds,
  idAndLabel,
  FormView,
  showAddPartnerForm,
  obFormTemplate
) {
  'use strict';

  return FormView.extend({

    template: obFormTemplate,

    localTopics: {
      'partners.synced': 'setUpSelect2'
    },

    events: {
      'submit': 'submitForm',
      'focus .form-group > .select2-offscreen': function(e)
      {
        this.$(e.currentTarget).select2('focus');
      },
      'change input[name="date"]': 'checkDateValidity',
      'change input[name^="goods"]': 'checkGoodsValidity',
      'keyup input[name^="goods"]': 'checkGoodsValidity',
      'keypress input[name="docNo"]': function(e)
      {
        e.currentTarget.setCustomValidity('');
      },
      'click .addPartner': showAddPartnerForm
    },

    destroy: function()
    {
      FormView.prototype.destroy.call(this);

      this.$('.select2-offscreen[tabindex="-1"]').select2('destroy');
    },

    serialize: function()
    {
      return _.extend(FormView.prototype.serialize.call(this), {
        palletKinds: palletKinds.map(idAndLabel)
      });
    },

    afterRender: function()
    {
      FormView.prototype.afterRender.call(this);

      this.setUpSelect2();
      this.resetGoodsValidity();
      this.focusFirstField();

      if (this.options.editMode)
      {
        this.$id('partner').select2('disable', true);
        this.$id('date').prop('disabled', true);
        this.$('.addPartner').remove();
      }
    },

    setUpSelect2: function()
    {
      var view = this;

      if (!user.data.partner)
      {
        this.$id('partner')
          .val(this.model.get('partner') || '')
          .select2({data: partners.map(idAndLabel)})
          .on('change', function(e)
          {
            view.model.set('partner', e.val, {silent: true});
          });
      }
    },

    resetGoodsValidity: function()
    {
      if (!this.options.editMode)
      {
        this.el.querySelector('.registryFormGoods input').setCustomValidity(
          t('registry', 'FORM:ERROR:goods:required')
        );
      }
    },

    focusFirstField: function()
    {
      if (this.options.editMode || user.data.partner)
      {
        this.$id('date').focus();
      }
      else
      {
        this.$id('partner').select2('focus');
      }
    },

    serializeToForm: function()
    {
      var formData = this.model.toJSON();

      formData.date = time.format(formData.date, 'YYYY-MM-DD');

      return formData;
    },

    serializeForm: function(formData)
    {
      if (!formData.goods)
      {
        formData.goods = {};
      }

      var keys = Object.keys(formData.goods);

      keys.forEach(function(key)
      {
        var count = formData.goods[key] = +formData.goods[key];

        if (isNaN(count) || count <= 0)
        {
          delete formData.goods[key];
        }
      });

      return formData;
    },

    checkDateValidity: function(e)
    {
      var el = e.target;
      var value = el.value;

      el.setCustomValidity('');

      if (value.trim() === '')
      {
        return;
      }

      var dateMoment = time.getMoment(value + ' 00:00:00');

      if (dateMoment.valueOf() > Date.now())
      {
        el.setCustomValidity(t('registry', 'FORM:ERROR:date:future'));
      }
    },

    checkGoodsValidity: function()
    {
      var $inputs = this.$('.registryFormGoods input');
      var anyGood = _.some($inputs, function(inputEl) { return parseInt(inputEl.value, 10) > 0; });

      $inputs[0].setCustomValidity(anyGood ? '' : t('registry', 'FORM:ERROR:goods:required'));
    },

    handleFailure: function(jqXhr)
    {
      var error = jqXhr.responseJSON && jqXhr.responseJSON.error ? jqXhr.responseJSON.error : null;

      if (error && t.has('registry', 'FORM:ERROR:' + error.message))
      {
        if (error.message === 'date:duplicate')
        {
          this.handleDuplicateDate();

          return;
        }

        this.showErrorMessage(t('registry', 'FORM:ERROR:' + error.message));

        this.$id(error.message.split(':')[0]).focus();
      }
      else
      {
        FormView.prototype.handleFailure.apply(this, arguments);
      }
    },

    handleDuplicateDate: function()
    {
      this.$id('date')[0].setCustomValidity(t('registry', 'FORM:ERROR:date:duplicate'));

      var $submit = this.$id('submit');

      this.timers.resubmit = setTimeout(function() { $submit.click(); }, 1);
    }

  });
});
