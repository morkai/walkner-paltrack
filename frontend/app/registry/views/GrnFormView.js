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
  'app/registry/templates/grnForm'
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
  grnFormTemplate
) {
  'use strict';

  return FormView.extend({

    template: grnFormTemplate,

    localTopics: {
      'partners.synced': 'setUpSelect2'
    },

    events: {
      'submit': 'submitForm',
      'focus .form-group > .select2-offscreen': function(e)
      {
        this.$(e.currentTarget).select2('focus');
      },
      'change input[name="receiver"], input[name="supplier"]': function()
      {
        this.checkPartnersValidity();
        this.cancelGoodsSearch();
        this.searchGoods();
      },
      'change input[name="date"]': 'checkDateValidity',
      'change input[name^="goods"]': 'checkGoodsValidity',
      'keyup input[name^="goods"]': 'checkGoodsValidity',
      'keypress input[name="docNo"]': function(e)
      {
        e.currentTarget.setCustomValidity('');
      },
      'keyup input[name="docNo"]': function()
      {
        this.cancelGoodsSearch();
        this.searchGoods();
      },
      'click .addPartner': showAddPartnerForm,
      'click .loadFromGdn': 'loadFromGdn'
    },

    initialize: function()
    {
      FormView.prototype.initialize.call(this);

      this.goodsSearchXhr = null;
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

      this.cancelGoodsSearch();
      this.searchGoods();
    },

    setUpSelect2: function()
    {
      var view = this;

      if (!user.data.partner)
      {
        this.$id('receiver')
          .val(this.model.get('receiver') || '')
          .select2({data: partners.map(idAndLabel)})
          .on('change', function(e)
          {
            view.model.set('receiver', e.val, {silent: true});
          });
      }

      this.$id('supplier')
        .val(this.model.get('supplier') || '')
        .select2({data: partners.withoutUsersPartner().map(idAndLabel)})
        .on('change', function(e)
        {
          view.model.set('supplier', e.val, {silent: true});
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
      if (this.options.editMode)
      {
        this.$id('docNo').focus();
      }
      else
      {
        this.$id(user.data.partner ? 'supplier' : 'receiver').select2('focus');
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

    checkPartnersValidity: function()
    {
      var receiver = this.$id('receiver').val();
      var $supplier = this.$id('supplier');
      var supplier = $supplier.val();

      if (!receiver || !supplier)
      {
        return;
      }

      $supplier[0].setCustomValidity(
        receiver === supplier ? t('registry', 'FORM:ERROR:supplier:receiver') : ''
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
        text: t('registry', 'MSG:grn:added', {docNo: this.model.getLabel()})
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
        goods: {}
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
    },

    cancelGoodsSearch: function()
    {
      this.$id('loadFromGdn').prop('disabled', true);

      if (this.goodsSearchXhr)
      {
        this.goodsSearchXhr.abort();
        this.goodsSearchXhr = null;
      }
    },

    searchGoods: _.debounce(function()
    {
      var data = {
        docNo: this.$id('docNo').val(),
        receiver: user.data.partner || this.$id('receiver').val(),
        supplier: this.$id('supplier').val()
      };

      if (!data.docNo.length || !data.receiver.length || !data.supplier.length)
      {
        return;
      }

      var view = this;

      var req = this.searchGoodsXhr = this.ajax({
        url: '/registry/grn;gdn',
        data: data
      });

      req.then(function(goods)
      {
        view.$id('loadFromGdn').data('goods', goods).prop('disabled', false);
      });

      req.always(function()
      {
        view.searchGoodsXhr = null;
      });
    }, 250),

    loadFromGdn: function()
    {
      var goods = this.$id('loadFromGdn').data('goods') || {};

      this.$('.form-control[name^="goods."]').each(function()
      {
        this.value = goods[this.name.replace('goods.', '')] || 0;
      });
    }

  });
});
