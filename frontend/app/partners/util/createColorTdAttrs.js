// Part of <https://miracle.systems/p/walkner-paltrack> licensed under <CC BY-NC-SA 4.0>

define([

], function(

) {
  'use strict';

  return function createColorTdAttrs(row, colorProperty)
  {
    if (!colorProperty)
    {
      colorProperty = this.colorProperty || this.id;
    }

    var className = [this.colorClassName || ''];

    if (!row[colorProperty])
    {
      return 'class="' + className.join(' ') + '"';
    }

    className.push('partners-color');

    var backgroundColor = row[colorProperty];

    return 'class="' + className.join(' ') + '" style="background-color: ' + backgroundColor + '"';
  };
});
