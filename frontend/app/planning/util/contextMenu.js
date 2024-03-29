// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/broker',
  'app/core/util/scrollbarSize',
  'app/planning/templates/contextMenu'
], function(
  _,
  $,
  broker,
  scrollbarSize,
  template
) {
  'use strict';

  var nextMenuId = 0;

  function focusPrev(e)
  {
    var items = $(e.currentTarget).closest('.planning-menu').find('[tabindex]:not(.planning-menu-disabled)').toArray();
    var index = items.indexOf(e.currentTarget) - 1;

    if (index === -1)
    {
      index = items.length - 1;
    }

    items[index].focus();

    return false;
  }

  function focusNext(e)
  {
    var items = $(e.currentTarget).closest('.planning-menu').find('[tabindex]:not(.planning-menu-disabled)').toArray();
    var index = items.indexOf(e.currentTarget) + 1;

    if (index >= items.length)
    {
      index = 0;
    }

    items[index].focus();

    return false;
  }

  return {

    isVisible: function(view)
    {
      return !!view.$contextMenu;
    },

    hide: function(view, animate)
    {
      var $menu = view.$contextMenu;

      if (!$menu)
      {
        return;
      }

      $(document.body).click();

      broker.publish('planning.contextMenu.hiding', {$menu: $menu});

      var options = $menu.data('options');

      $(window).off('.contextMenu.' + view.idPrefix);
      $(document.body).off('.contextMenu.' + view.idPrefix);

      $menu.data('backdrop').remove();
      $menu.removeData('backdrop');
      $menu.removeData('options');

      if (options.animate === false || animate === false)
      {
        $menu.remove();
      }
      else
      {
        $menu.fadeOut('fast', function() { $menu.remove(); });
      }

      view.$contextMenu = null;

      broker.publish('planning.contextMenu.hidden');
    },

    show: function(view, top, left, options)
    {
      var hideMenu = this.hide.bind(this, view);
      var showMenu = this.show.bind(this, view, top, left, options);
      var menuId = ++nextMenuId;
      var menu;

      if (options.menu)
      {
        menu = options.menu;
      }
      else
      {
        options = {menu: options};
        menu = options.menu;
      }

      hideMenu(false);

      menu = menu
        .map(function(item)
        {
          if (item === '-')
          {
            return {type: 'divider'};
          }

          if (typeof item === 'string')
          {
            return {type: 'header', label: item};
          }

          if (!item.type)
          {
            item.type = 'item';
          }

          return item;
        })
        .filter(function(item) { return item.visible !== false; });

      menu = menu.filter(function(item, i)
      {
        var next = menu[i + 1];

        return item.type !== 'header' || (item.type === 'header' && next && next.type === 'item');
      });

      var $menu = $(template({
        className: options.className || '',
        top: top,
        icons: _.some(menu, function(item) { return !!item.icon; }),
        menu: menu
      }));

      $menu.on('mousedown', function(e)
      {
        if (e.which !== 1)
        {
          return false;
        }

        e.stopPropagation();
      });
      $menu.on('mouseup', function(e)
      {
        if (e.which !== 1)
        {
          return false;
        }
      });
      $menu.on('contextmenu', false);
      $menu.on('click', 'a[data-action]', function(e)
      {
        var el = e.currentTarget;

        if (el.classList.contains('planning-menu-disabled')
          || el.classList.contains('planning-menu-loading'))
        {
          return;
        }

        var action = el.dataset.action;
        var item = menu[action];

        $menu.find('a').addClass('planning-menu-loading');

        e.contextMenu = {
          id: menuId,
          hide: true,
          action: action,
          item: item,
          view: view,
          top: options.top,
          left: options.left,
          menu: menu,
          restore: showMenu
        };

        if (item && item.handler)
        {
          item.handler(e);
        }

        if (e.contextMenu.hide)
        {
          hideMenu();
        }
        else
        {
          $menu.find(el).find('.fa').attr('class', 'fa fa-spinner fa-spin');
        }
      });
      $menu.on('keydown', '[tabindex]', function(e)
      {
        var tagName = e.currentTarget.tagName;
        var input = tagName === 'SELECT' || tagName === 'TEXTAREA' || tagName === 'INPUT';
        var upDown = tagName !== 'SELECT' && tagName !== 'TEXTAREA';
        var enter = upDown && tagName !== 'INPUT';

        switch (e.originalEvent.key)
        {
          case 'ArrowUp':
            return upDown ? focusPrev(e) : undefined;

          case 'ArrowDown':
            return upDown ? focusNext(e) : undefined;

          case 'Tab':
            return e.shiftKey ? focusPrev(e) : focusNext(e);

          case ' ':
          case 'Enter':
          {
            if (enter)
            {
              var click = new $.Event('click');

              click.pageY = options.top;
              click.pageX = options.left;

              $(e.currentTarget).trigger(click);

              return false;
            }

            break;
          }

          case 'Delete':
          case 'Backspace':
            if (!input)
            {
              hideMenu();

              return false;
            }
            break;

          case 'Escape':
          {
            hideMenu();

            return false;
          }
        }
      });

      var $backdrop = $('<div class="planning-menu-backdrop"></div>').one('mousedown', hideMenu);

      $menu.data('backdrop', $backdrop);
      $menu.data('options', options);
      $menu.data('id', menuId);

      $(window)
        .one('scroll.contextMenu.' + view.idPrefix, hideMenu)
        .one('resize.contextMenu.' + view.idPrefix, hideMenu);
      $(document.body)
        .one('mousedown.contextMenu.' + view.idPrefix, function(e)
        {
          if (!options.hideFilter || options.hideFilter(e))
          {
            hideMenu();
          }
        })
        .append($backdrop)
        .append($menu);

      view.$contextMenu = $menu;

      this.position(view, top, left);

      menu.forEach(function(item, i)
      {
        if (item.template && item.handler)
        {
          item.handler($menu.find('li[data-action="' + i + '"]'));
        }
      });

      if (options.autoFocus !== false)
      {
        if ($menu.find('[autofocus]').length)
        {
          $menu.find('[autofocus]').first().focus().select();
        }
        else
        {
          $menu.find('[tabindex]:not(.planning-menu-disabled)').first().focus();
        }
      }

      broker.publish('planning.contextMenu.shown', {$menu: $menu});
    },

    position: function(view, top, left)
    {
      if (!view.$contextMenu)
      {
        return;
      }

      var $menu = view.$contextMenu;

      position(false);

      function position(again)
      {
        var width = $menu.outerWidth();
        var height = $menu.outerHeight();

        if (left + width >= document.body.clientWidth)
        {
          left -= (left + width) - document.body.clientWidth + 5;
        }

        var maxHeight = window.innerHeight + window.pageYOffset;

        if (top + height >= maxHeight)
        {
          top -= (top + height) - maxHeight + 5;
        }

        $menu.css({
          top: top + 'px',
          left: left + 'px'
        });

        _.assign($menu.data('options'), {
          top: top,
          left: left
        });

        if (!again && $menu[0].scrollHeight > $menu[0].offsetHeight)
        {
          position(true);
        }
      }
    },

    actions: {


    }

  };
});
