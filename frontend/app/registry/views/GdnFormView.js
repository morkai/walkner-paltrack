// Part of <https://miracle.systems/p/walkner-paltrack> licensed under <CC BY-NC-SA 4.0>

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
  'app/registry/templates/gdnForm'
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
  gdnFormTemplate
) {
  'use strict';

  return FormView.extend({

    template: gdnFormTemplate,

    localTopics: {
      'partners.synced': 'setUpSelect2'
    },

    events: {
      'submit': 'submitForm',
      'focus .form-group > .select2-offscreen': function(e)
      {
        this.$(e.currentTarget).select2('focus');
      },
      'change input[name="receiver"], input[name="supplier"]': 'checkPartnersValidity',
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
        this.$id('supplier').select2('disable', true);
        this.$id('receiver').select2('disable', true);
        this.$('.addPartner').remove();
      }
    },

    setUpSelect2: function()
    {
      var view = this;

      if (!user.data.partner)
      {
        this.$id('supplier')
          .val(this.model.get('supplier') || '')
          .select2({data: partners.map(idAndLabel)})
          .on('change', function(e)
          {
            view.model.set('supplier', e.val, {silent: true});
          });
      }

      this.$id('receiver')
        .val(this.model.get('receiver') || '')
        .select2({data: partners.withoutUsersPartner().map(idAndLabel)})
        .on('change', function(e)
        {
          view.model.set('receiver', e.val, {silent: true});
        });
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
      this.$id(user.data.partner ? 'receiver' : 'supplier').select2('focus');
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

    checkPartnersValidity: function()
    {
      var supplier = this.$id('supplier').val();
      var $receiver = this.$id('receiver');
      var receiver = $receiver.val();

      if (!receiver || !supplier)
      {
        return;
      }

      $receiver[0].setCustomValidity(
        receiver === supplier ? t('registry', 'FORM:ERROR:receiver:supplier') : ''
      );
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

    handleSuccess: function()
    {
      if (this.options.editMode)
      {
        return FormView.prototype.handleSuccess.apply(this, arguments);
      }

      viewport.msg.show({
        type: 'success',
        time: 1500,
        text: t('registry', 'MSG:gdn:added', {docNo: this.model.get('docNo')})
      });

      this.$('.registryLastAdded')
        .fadeIn()
        .find('a')
          .attr('href', this.model.genClientUrl())
          .html(t('registry', 'lastAdded:details', {
            docNo: this.model.get('docNo'),
            supplier: partners.get(this.model.get('supplier')).get('name'),
            receiver: partners.get(this.model.get('receiver')).get('name')
          }));

      this.model.set({
        _id: undefined,
        docNo: null,
        goods: []
      });

      this.resetGoodsValidity();
      this.focusFirstField();
    },

    handleFailure: function(jqXhr)
    {
      var error = jqXhr.responseJSON && jqXhr.responseJSON.error ? jqXhr.responseJSON.error : null;

      if (error && t.has('registry', 'FORM:ERROR:' + error.message))
      {
        if (error.message === 'docNo:duplicate')
        {
          this.handleDuplicateDocNo();

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

    handleDuplicateDocNo: function()
    {
      this.$id('docNo')[0].setCustomValidity(t('registry', 'FORM:ERROR:docNo:duplicate'));

      var $submit = this.$id('submit');

      this.timers.resubmit = setTimeout(function() { $submit.click(); }, 1);
    }

  });
});
