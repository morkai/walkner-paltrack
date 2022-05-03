// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'app/viewport'
], function(
  $,
  viewport
) {
  'use strict';

  var $clone = null;
  var lastEl = null;

  return function fitTextArea(el, options)
  {
    if (el !== lastEl)
    {
      if ($clone)
      {
        $clone.remove();
      }

      lastEl = el;
      $clone = $(el)
        .clone()
        .attr('id', null)
        .attr('tabindex', '-1')
        .css({
          width: el.clientWidth + 'px',
          height: '',
          position: 'absolute',
          top: '-9999px',
          left: '-9999px',
          pointerEvents: 'none'
        })
        .insertAfter(el);
    }
    else
    {
      $clone[0].style.width = el.clientWidth + 'px';
      $clone[0].value = el.value;
    }

    var oldHeight = el.style.height;
    var newHeight = Math.min($clone[0].scrollHeight + 2, options && options.maxHeight || 114) + 'px';

    if (newHeight !== oldHeight)
    {
      el.style.height = newHeight;

      if (options && options.adjustDialogBackdrop)
      {
        viewport.adjustDialogBackdrop();
      }
    }
  };
});
