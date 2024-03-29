// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/user',
  'app/planning/util/contextMenu',
  '../View',
  './ActionFormView',
  './PaginationView',
  'app/core/templates/list'
], function(
  _,
  $,
  t,
  user,
  contextMenu,
  View,
  ActionFormView,
  PaginationView,
  listTemplate
) {
  'use strict';

  var ListView = View.extend({

    template: listTemplate,

    tableClassName: 'table-bordered table-hover table-condensed',

    paginationOptions: {},

    refreshDelay: 5000,

    crudTopics: 'separate',

    columnLabelPrefix: 'LIST:COLUMN:',

    remoteTopics: function()
    {
      var topics = {};
      var topicPrefix = this.collection.getTopicPrefix();

      if (topicPrefix)
      {
        if (this.crudTopics === 'separate')
        {
          topics[topicPrefix + '.added'] = 'onModelAdded';
          topics[topicPrefix + '.edited'] = 'onModelEdited';
          topics[topicPrefix + '.deleted'] = 'onModelDeleted';
        }
        else if (this.crudTopics === 'updated')
        {
          topics[topicPrefix + '.updated'] = 'onModelsUpdated';
        }
      }

      return topics;
    },

    events: {
      'click .list-item[data-id]': function(e)
      {
        if (e.target.classList.contains('actions-group'))
        {
          return false;
        }

        if (this.isNotClickable(e))
        {
          return;
        }

        var url = this.collection.get(e.currentTarget.dataset.id).genClientUrl();

        if (e.ctrlKey)
        {
          window.open(url);
        }
        else if (!e.altKey)
        {
          this.broker.publish('router.navigate', {
            url: url,
            trigger: true,
            replace: false
          });
        }
      },
      'mousedown .list-item[data-id]': function(e)
      {
        if (this.isNotClickable(e) || e.button !== 1 || this.isScrollable())
        {
          return;
        }

        e.preventDefault();
      },
      'mouseup .list-item[data-id]': function(e)
      {
        if (this.isNotClickable(e) || e.button !== 1 || this.isScrollable())
        {
          return;
        }

        window.open(this.collection.get(e.currentTarget.dataset.id).genClientUrl());

        return false;
      },
      'click .action-delete': function(e)
      {
        e.preventDefault();

        ActionFormView.showDeleteDialog({model: this.getModelFromEvent(e)});
      },
      'click .is-filter': function(e)
      {
        this.trigger('showFilter', e.currentTarget.dataset.columnId);
      },
      'contextmenu .list-item[data-id]': function(e)
      {
        if (e.ctrlKey)
        {
          return;
        }

        var $row = this.$(e.currentTarget);

        if ($row.find('.actions').length)
        {
          e.preventDefault();

          var modelId = $row[0].dataset.id;
          var columnId = this.$(e.target).closest('td')[0].dataset.id;

          this.showContextMenu(modelId, columnId, e.pageY, e.pageX);
        }
      }
    },

    initialize: function()
    {
      this.refreshReq = null;
      this.lastRefreshAt = 0;

      this.listenTo(this.collection, 'sync', function()
      {
        this.lastRefreshAt = Date.now();
      });

      this.once('afterRender', function()
      {
        this.listenTo(this.collection, 'reset', this.onReset);
      });

      if (this.collection.paginationData)
      {
        this.paginationView = new PaginationView(_.assign(
          {replaceUrl: !!this.options.replaceUrl},
          this.paginationOptions,
          this.options.pagination,
          {model: this.collection.paginationData}
        ));

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
      return _.assign(View.prototype.serialize.apply(this, arguments), {
        columns: this.decorateColumns(this.serializeColumns()),
        actions: this.serializeActions(),
        rows: this.serializeRows(),
        className: _.result(this, 'className'),
        tableClassName: _.result(this, 'tableClassName'),
        noData: this.options.noData || t('core', 'LIST:NO_DATA'),
        panel: this.options.panel,
        renderValue: function(column, row)
        {
          if (row[column.valueProperty] == null)
          {
            if (column.noData == null)
            {
              return '<em>' + t('core', 'LIST:NO_DATA:cell') + '</em>';
            }

            return column.noData;
          }

          if (typeof column.tdDecorator === 'function')
          {
            return column.tdDecorator(column.id, row[column.valueProperty], row, column);
          }

          return row[column.valueProperty];
        }
      });
    },

    serializeColumns: function()
    {
      var columns = this.options.columns || this.columns;

      if (typeof columns === 'function')
      {
        columns = columns.call(this);
      }

      if (!Array.isArray(columns))
      {
        columns = [];
      }

      return columns;
    },

    decorateColumns: function(columns)
    {
      var view = this;
      var nlsDomain = view.collection.getNlsDomain();

      return columns.map(function(column)
      {
        if (!column)
        {
          return null;
        }

        if (column === '-')
        {
          column = {id: 'filler', label: ''};
        }
        else if (typeof column === 'string')
        {
          column = {id: column};
        }

        if (column.visible === false)
        {
          return null;
        }

        if (!column.valueProperty)
        {
          column.valueProperty = column.id;
        }

        if (typeof column.label === 'string' && column.label.endsWith(':'))
        {
          column.label = t.bound(nlsDomain, column.label + column.id);
        }

        if (!column.label && column.label !== '')
        {
          var labelKey = _.result(view, 'columnLabelPrefix') + column.id;

          if (!t.has(nlsDomain, labelKey))
          {
            labelKey = 'PROPERTY:' + column.id;
          }

          column.label = t.bound(nlsDomain, labelKey);
        }

        ['th', 'td'].forEach(function(prefix)
        {
          var prop = prefix + 'Attrs';
          var _prop = '_' + prop;
          var attrs = column[_prop] || column[prop];

          if (_.isFunction(attrs) || (_.isObject(attrs) && !_.isArray(attrs)))
          {
            // OK
          }
          else
          {
            attrs = {};
          }

          if (!column[_prop])
          {
            column[_prop] = attrs;
          }

          column[prop] = view.decorateAttrs.bind(view, prefix, column[_prop]);
        });

        return column;
      }).filter(function(column) { return column !== null; });
    },

    decorateAttrs: function(prefix, attrs, row, column)
    {
      if (typeof attrs === 'string')
      {
        return attrs;
      }

      if (prefix === 'th')
      {
        column = row;
        row = {};
      }

      if (_.isFunction(attrs))
      {
        attrs = prefix === 'th' ? attrs(column) : attrs(row, column);
      }

      var className = [];

      if (_.isArray(attrs.className))
      {
        className = className.concat(attrs.className);
      }
      else if (_.isString(attrs.className))
      {
        className.push(attrs.className);
      }

      className.push(
        _.result(column, 'className'),
        _.result(column, prefix + 'ClassName')
      );

      if (column.min)
      {
        className.push('is-min');
      }

      className = className
        .map(function(cn) { return Array.isArray(cn) ? cn.join(' ') : cn; })
        .filter(function(cn) { return !!cn; })
        .join(' ');

      var htmlAttrs = [];

      if (className.length)
      {
        htmlAttrs.push('class="' + className + '"');
      }

      if (!column.titleProperty && prefix === 'td' && className.indexOf('is-overflow') !== -1)
      {
        column.titleProperty = column.id;
      }

      if (column.titleProperty)
      {
        attrs.title = typeof column.titleProperty === 'function'
          ? row[column.titleProperty(row, column)]
          : row[column.titleProperty];
      }

      if (attrs.title)
      {
        attrs.title = String(attrs.title).replace(/<\/?[a-z].*?>/g, '');
      }

      if (column.width)
      {
        if (!attrs.style)
        {
          attrs.style = {};
        }

        attrs.style.width = column.width;
      }

      Object.keys(attrs).forEach(function(key)
      {
        if (key === 'className')
        {
          return;
        }

        var value = attrs[key];

        if (_.isFunction(value))
        {
          value = value(key, attrs, row, column);
        }

        if (_.isArray(value))
        {
          value = value.join(' ');
        }
        else if (key === 'style' && _.isObject(value))
        {
          var style = [];

          Object.keys(value).forEach(function(k)
          {
            style.push(k + ': ' + value[k]);
          });

          value = style.join('; ');
        }

        if (key.charAt(0) === '!')
        {
          key = key.substring(1);
        }
        else
        {
          value = _.escape(value);
        }

        htmlAttrs.push(key + '="' + value + '"');
      });

      return htmlAttrs.join(' ');
    },

    serializeActions: function()
    {
      if (this.actions !== undefined)
      {
        return _.result(this, 'actions');
      }

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

    onModelAdded: function(message)
    {
      this.refreshCollection(message);
    },

    onModelEdited: function(message)
    {
      this.refreshCollection(message);
    },

    onModelDeleted: function(message)
    {
      if (!message)
      {
        return;
      }

      var Model = this.collection.model;
      var model = new Model(message.model || message, {parse: true});

      if (!model.id)
      {
        return;
      }

      this.$row(model.id).addClass('is-deleted');

      this.refreshCollection(model);
    },

    onModelsUpdated: function(message)
    {
      if (!message)
      {
        return;
      }

      var view = this;

      (message.deleted || []).forEach(function(model)
      {
        view.onModelDeleted({model: model, user: message.user});
      });

      (message.added || []).forEach(function(model)
      {
        view.onModelAdded({model: model, user: message.user});
      });

      (message.updated || []).forEach(function(model)
      {
        view.onModelEdited({model: model, user: message.user});
      });
    },

    onReset: function()
    {
      this.render();
    },

    $row: function(rowId)
    {
      return this.$('.list-item[data-id="' + rowId + '"]');
    },

    $cell: function(rowId, columnId)
    {
      return this.$('.list-item[data-id="' + rowId + '"] td[data-id="' + columnId + '"]').first();
    },

    refreshCollection: function(message)
    {
      if (message && this.timers.refreshCollection)
      {
        return;
      }

      var now = Date.now();

      if (now - this.lastRefreshAt > this.refreshDelay)
      {
        this.lastRefreshAt = now;
        this.refreshCollectionNow();
      }
      else
      {
        this.timers.refreshCollection = setTimeout(this.refreshCollectionNow.bind(this), this.refreshDelay);
      }
    },

    refreshCollectionNow: function(options)
    {
      if (!this.timers)
      {
        return;
      }

      if (this.timers.refreshCollection)
      {
        clearTimeout(this.timers.refreshCollection);
      }

      delete this.timers.refreshCollection;

      if (this.refreshReq)
      {
        this.refreshReq.abort();
      }

      var view = this;
      var req = this.promised(this.collection.fetch(_.isObject(options) ? options : {reset: true}));

      req.always(function()
      {
        if (view.refreshReq === req)
        {
          view.refreshReq.abort();
          view.refreshReq = null;
        }
      });

      this.refreshReq = req;
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
    },

    isNotClickable: function(e)
    {
      var listEl = this.el.classList.contains('list') ? this.el : this.el.querySelector('.list');
      var targetEl = e.target;
      var tagName = targetEl.tagName;

      return !listEl.classList.contains('is-clickable')
        || tagName === 'A'
        || tagName === 'INPUT'
        || tagName === 'BUTTON'
        || targetEl.classList.contains('actions')
        || window.getSelection().toString() !== ''
        || (tagName !== 'TD' && this.$(targetEl).closest('a, input, button').length);
    },

    isScrollable: function()
    {
      var el = this.el.querySelector('.table-responsive');

      if (!el)
      {
        return false;
      }

      return el.scrollWidth > el.offsetWidth;
    },

    showContextMenu: function(modelId, columnId, top, left)
    {
      var view = this;
      var model = this.collection.get(modelId);

      if (!model || !view.serializeActions)
      {
        return;
      }

      try
      {
        var menu = this.serializeContextMenu(model, columnId);

        if (menu.length)
        {
          contextMenu.show(view, top, left, menu);
        }
      }
      catch (err)
      {
        console.error(err);
      }
    },

    hideContextMenu()
    {
      contextMenu.hide(this);
    },

    serializeContextMenu: function(model)
    {
      var view = this;
      var row = view.serializeRow(model);
      var actions = view.serializeActions();

      return (actions ? actions(row) : [])
        .filter(function(action)
        {
          return !!action
            && !action.disabled
            && (!action.className || action.className.indexOf('disabled') === -1);
        })
        .map(function(action)
        {
          return {
            icon: 'fa-' + action.icon,
            label: action.label,
            handler: function()
            {
              setTimeout(function()
              {
                var $action = view.$row(row._id).find('.action-' + action.id);

                if ($action.length)
                {
                  $action[0].click();
                }
              }, 1);
            }
          };
        });
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
      var Model = collection.model;
      var canEdit = Model.can && (Model.can.edit || Model.can.manage);
      var canDelete = Model.can && (Model.can.delete || Model.can.manage);

      return function(row)
      {
        var model = collection.get(row._id);
        var actions = [ListView.actions.viewDetails(model, nlsDomain)];
        var canManage = user.isAllowedTo((privilegePrefix || model.getPrivilegePrefix()) + ':MANAGE');

        if ((canEdit && canEdit.call(Model, model, 'edit')) || (!canEdit && canManage))
        {
          actions.push(ListView.actions.edit(model, nlsDomain));
        }

        if ((canDelete && canDelete.call(Model, model, 'delete')) || (!canDelete && canManage))
        {
          actions.push(ListView.actions.delete(model, nlsDomain));
        }

        return actions;
      };
    }
  };

  return ListView;
});
