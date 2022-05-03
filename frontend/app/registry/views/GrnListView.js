// Part of <https://miracle.systems/p/walkner-paltrack> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'underscore',
  'app/i18n',
  'app/user',
  'app/data/palletKinds',
  'app/core/views/ListView',
  'app/partners/util/createColorTdAttrs',
  'app/registry/templates/gnListSummary'
], function(
  $,
  _,
  t,
  user,
  palletKinds,
  ListView,
  createColorTdAttrs,
  renderGnListSummary
) {
  'use strict';

  return ListView.extend({

    className: 'registryList grn is-clickable',

    firstPartnerProperty: 'receiver',
    secondPartnerProperty: 'supplier',

    localTopics: {
      'partners.synced': 'render',
      'palletKinds.synced': 'render'
    },

    remoteTopics: function()
    {
      var remoteTopics = ListView.prototype.remoteTopics.call(this);

      remoteTopics[this.collection.getTopicPrefix() + '.checked.**'] = 'onGnChecked';

      return remoteTopics;
    },

    events: _.extend({}, ListView.prototype.events, {
      'click .gn-checked.is-editable': 'toggleChecked'
    }),

    initialize: function()
    {
      ListView.prototype.initialize.apply(this, arguments);

      this.summary = {};
    },

    serializeColumns: function()
    {
      var columns = [
        {
          id: this.firstPartnerProperty,
          colorProperty: this.firstPartnerProperty + 'Color',
          colorClassName: 'is-min',
          tdAttrs: createColorTdAttrs
        },
        {
          id: this.secondPartnerProperty,
          colorProperty: this.secondPartnerProperty + 'Color',
          colorClassName: 'is-min',
          tdAttrs: createColorTdAttrs
        },
        {
          id: 'date',
          className: 'is-min'
        },
        {
          id: 'docNo',
          className: 'is-min'
        }
      ];

      if (user.data.partner)
      {
        columns.shift();
      }

      palletKinds.sort().forEach(function(palletKind)
      {
        columns.push({
          id: 'goods.' + palletKind.id,
          label: palletKind.getLabel(),
          tdAttrs: 'class="number is-min"',
          noData: 0
        });
      });

      var checkedColumn = {
        id: 'checked',
        tdClassName: ['gn-checked'],
        tdAttrs: {}
      };

      if (user.isAllowedTo('REGISTRY:CHECK'))
      {
        checkedColumn.tdClassName.push('is-editable');
        checkedColumn.tdAttrs.tabindex = '0';
      }

      columns.push(checkedColumn);

      columns.unshift({
        id: 'no',
        label: t('core', '#'),
        tdAttrs: 'class="no is-min"'
      });

      return columns;
    },

    serializeRows: function()
    {
      var view = this;
      var skip = this.collection.rqlQuery.skip;

      this.summary = {};

      return this.collection.invoke('serialize').map(function(obj, i)
      {
        obj.no = (skip + i + 1) + '.';

        var summary = view.summary;

        for (var j = 0, l = obj.goods.length; j < l; ++j)
        {
          var palletGoods = obj.goods[j];

          if (summary[palletGoods.palletKind] === undefined)
          {
            summary[palletGoods.palletKind] = palletGoods.count;
          }
          else
          {
            summary[palletGoods.palletKind] += palletGoods.count;
          }
        }

        return obj;
      });
    },

    afterRender: function()
    {
      ListView.prototype.afterRender.call(this);

      this.renderSummary();
    },

    renderSummary: function()
    {
      var goods = [];
      var summary = this.summary;

      palletKinds.forEach(function(palletKind)
      {
        goods.push((summary[palletKind.id] || 0).toLocaleString());
      });

      this.$('.registryList-summary').remove();
      this.$('thead').after(renderGnListSummary({
        from: this.collection.rqlQuery.skip + 1,
        to: this.collection.rqlQuery.skip + this.collection.length,
        goods: goods
      }));
    },

    onGnChecked: function(message)
    {
      var model = this.collection.get(message.id);

      if (model)
      {
        model.set({checked: message.checked}, {silent: true});

        this.renderCheckedIndicator(model);
      }
    },

    toggleChecked: function(e)
    {
      var $td = this.$(e.currentTarget).closest('.gn-checked');
      var $fa = $td.find('.fa');

      if ($fa.hasClass('.fa-spin') || !this.socket.isConnected())
      {
        return;
      }

      var model = this.collection.get($td.parent().attr('data-id'));

      if (!model)
      {
        return;
      }

      var checked = !$fa.hasClass('fa-thumbs-up');

      $td.attr('tabindex', '').addClass('is-loading');
      $fa.removeClass('fa-thumbs-up fa-thumbs-down').addClass('fa-spinner fa-spin');

      var view = this;
      var xhr = this.ajax({
        type: 'POST',
        url: model.url() + ';check',
        data: JSON.stringify({checked: checked})
      });

      xhr.fail(function()
      {
        view.renderCheckedIndicator(model);
      });

      return false;
    },

    renderCheckedIndicator: function(model)
    {
      var $td = this.$('.list-item[data-id="' + model.id + '"] > .gn-checked');

      $td.find('.fa')
        .removeClass('fa-thumbs-up fa-thumbs-down fa-spinner fa-spin')
        .addClass(model.get('checked') ? 'fa-thumbs-up' : 'fa-thumbs-down');

      if (user.isAllowedTo('REGISTRY:CHECK'))
      {
        $td.attr('tabindex', '0');
      }

      $td.removeClass('is-loading');
      $td.parent().toggleClass('is-checked', model.get('checked'));
    }

  });
});
