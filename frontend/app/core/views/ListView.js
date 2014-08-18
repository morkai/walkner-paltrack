// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-paltrack project <http://lukasz.walukiewicz.eu/p/walkner-paltrack>

define([
  'jquery',
  'app/i18n',
  'app/user',
  '../View',
  './ActionFormView',
  './PaginationView',
  'app/core/templates/list'
], function(
  $,
  t,
  user,
  View,
  ActionFormView,
  PaginationView,
  listTemplate
) {
  'use strict';

  var ListView = View.extend({

    template: listTemplate,

    remoteTopics: function()
    {
      var topics = {};
      var topicPrefix = this.collection.getTopicPrefix();

      if (topicPrefix)
      {
        topics[topicPrefix + '.added'] = 'refreshCollection';
        topics[topicPrefix + '.edited'] = 'refreshCollection';
        topics[topicPrefix + '.deleted'] = 'onModelDeleted';
      }

      return topics;
    },

    events: {
      'click .action-delete': function(e)
      {
        e.preventDefault();

        ActionFormView.showDeleteDialog({model: this.getModelFromEvent(e)});
      }
    },

    initialize: function()
    {
      this.lastRefreshAt = 0;

      this.listenTo(this.collection, 'sync', function()
      {
        this.lastRefreshAt = Date.now();
      });

      if (this.collection.paginationData)
      {
        this.paginationView = new PaginationView({
          model: this.collection.paginationData
        });

        this.setView('.pagination-container', this.paginationView);

        this.listenTo(this.collection.paginationData, 'change:page', this.scrollTop);
      }
    },

    destroy: function()
    {
      this.paginationView = null;
    },

    serialize: function()
    {
      return {
        columns: this.decorateColumns(this.serializeColumns()),
        actions: this.serializeActions(),
        rows: this.serializeRows(),
        className: this.className
      };
    },

    serializeColumns: function()
    {
      var columns;

      if (Array.isArray(this.options.columns))
      {
        columns = this.options.columns;
      }
      else if (Array.isArray(this.columns))
      {
        columns = this.columns;
      }
      else
      {
        columns = [];
      }

      return columns;
    },

    decorateColumns: function(columns)
    {
      var nlsDomain = this.collection.getNlsDomain();

      return columns.map(function(column)
      {
        if (typeof column === 'string')
        {
          column = {id: column, label: t(nlsDomain, 'PROPERTY:' + column)};
        }

        if (!column.label)
        {
          column.label = t(nlsDomain, 'PROPERTY:' + column.id);
        }

        return column;
      });
    },

    serializeActions: function()
    {
      return ListView.actions.viewEditDelete(this.collection);
    },

    serializeRows: function()
    {
      return this.collection.map(this.options.serializeRow || this.serializeRow, this);
    },

    serializeRow: function(model)
    {
      if (typeof model.serializeRow === 'function')
      {
        return model.serializeRow();
      }

      if (typeof model.serialize === 'function')
      {
        return model.serialize();
      }

      return model.toJSON();
    },

    beforeRender: function()
    {
      this.stopListening(this.collection, 'reset', this.render);
    },

    afterRender: function()
    {
      this.listenToOnce(this.collection, 'reset', this.render);
    },

    onModelDeleted: function(message)
    {
      if (!message || !message.model || !message.model._id)
      {
        return;
      }

      this.$('.list-item[data-id="' + message.model._id + '"]').addClass('is-deleted');

      this.refreshCollection(message);
    },

    refreshCollection: function(message)
    {
      if (message && this.timers.refreshCollection)
      {
        return;
      }

      if (Date.now() - this.lastRefreshAt > 3000)
      {
        this.refreshCollectionNow();
      }
      else
      {
        this.timers.refreshCollection = setTimeout(this.refreshCollectionNow.bind(this), 3000);
      }
    },

    refreshCollectionNow: function(options)
    {
      if (this.timers.refreshCollection)
      {
        clearTimeout(this.timers.refreshCollection);
      }

      delete this.timers.refreshCollection;

      this.promised(this.collection.fetch(options || {reset: true}));
    },

    scrollTop: function()
    {
      var y = this.$el.offset().top - 14;
      var $navbar = $('.navbar-fixed-top');

      if ($navbar.length)
      {
        y -= $navbar.outerHeight();
      }

      if (window.scrollY > y)
      {
        $('html, body').stop(true, false).animate({scrollTop: y});
      }
    },

    getModelFromEvent: function(e)
    {
      return this.collection.get(this.$(e.target).closest('.list-item').attr('data-id'));
    }

  });

  function getLabel(model, nlsDomain, key)
  {
    if (!nlsDomain)
    {
      nlsDomain = model.getNlsDomain();
    }

    if (t.has(nlsDomain, key))
    {
      return t(nlsDomain, key);
    }

    return t('core', key);
  }

  ListView.actions = {
    viewDetails: function(model, nlsDomain)
    {
      return {
        id: 'viewDetails',
        icon: 'file-text-o',
        label: getLabel(model, nlsDomain, 'LIST:ACTION:viewDetails'),
        href: model.genClientUrl()
      };
    },
    edit: function(model, nlsDomain)
    {
      return {
        id: 'edit',
        icon: 'edit',
        label: getLabel(model, nlsDomain, 'LIST:ACTION:edit'),
        href: model.genClientUrl('edit')
      };
    },
    delete: function(model, nlsDomain)
    {
      return {
        id: 'delete',
        icon: 'times',
        label: getLabel(model, nlsDomain, 'LIST:ACTION:delete'),
        href: model.genClientUrl('delete')
      };
    },
    viewEditDelete: function(collection, privilegePrefix, nlsDomain)
    {
      return function(row)
      {
        var model = collection.get(row._id);
        var actions = [ListView.actions.viewDetails(model, nlsDomain)];

        if (user.isAllowedTo((privilegePrefix || model.getPrivilegePrefix()) + ':MANAGE'))
        {
          actions.push(
            ListView.actions.edit(model, nlsDomain),
            ListView.actions.delete(model, nlsDomain)
          );
        }

        return actions;
      };
    }
  };

  return ListView;
});
