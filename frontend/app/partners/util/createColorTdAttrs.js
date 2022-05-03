// Part of <https://miracle.systems/p/walkner-paltrack> licensed under <CC BY-NC-SA 4.0>

define([

], function(

) {
  'use strict';

  return function createColorTdAttrs(row, column)
  {
    const colorProperty = column.colorProperty || column.id;
    const className = [column.colorClassName || ''];

    if (!row[colorProperty])
    {
      return {
        className: className.join(' ')
      };
    }

    className.push('partners-color');

    const backgroundColor = row[colorProperty];

    return {
      className: className.join(' '),
      style: `background-color: ${backgroundColor}`
    };
  };
});
