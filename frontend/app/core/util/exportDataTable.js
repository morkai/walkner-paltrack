// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery'
], function(
  $
) {
  'use strict';

  var TEXTAREA = $('<textarea/>')[0];
  var PLACEHOLDER = {};

  // https://stackoverflow.com/a/42535830
  function getHeaders(dt, config)
  {
    var thRows = $(dt.table().header()).children();
    var numRows = thRows.length;
    var matrix = [];
    var i;
    var j;

    // Iterate over each row of the header and add information to matrix.
    for (var rowIdx = 0; rowIdx < numRows; rowIdx++)
    {
      var $row = $(thRows[rowIdx]);

      // Iterate over actual columns specified in this row.
      var $ths = $row.children('th');

      for (var colIdx = 0; colIdx < $ths.length; colIdx++)
      {
        var $th = $($ths.get(colIdx));
        var colspan = $th.attr('colspan') || 1;
        var rowspan = $th.attr('rowspan') || 1;
        var colCount = 0;

        // ----- add this cell's title to the matrix
        if (matrix[rowIdx] === undefined)
        {
          matrix[rowIdx] = []; // create array for this row
        }

        // find 1st empty cell
        for (j = 0; j < (matrix[rowIdx]).length; j++, colCount++)
        {
          if (matrix[rowIdx][j] === PLACEHOLDER)
          {
            break;
          }
        }

        var myColCount = colCount;

        matrix[rowIdx][colCount++] = config.format.header($th[0].innerHTML, myColCount, $th[0]);

        // ----- If title cell has colspan, add empty titles for extra cell width.
        for (j = 1; j < colspan; j++)
        {
          matrix[rowIdx][colCount++] = '';
        }

        // ----- If title cell has rowspan, add empty titles for extra cell height.
        for (i = 1; i < rowspan; i++)
        {
          var thisRow = rowIdx + i;

          if (matrix[thisRow] === undefined)
          {
            matrix[thisRow] = [];
          }

          // First add placeholder text for any previous columns.
          for (j = (matrix[thisRow]).length; j < myColCount; j++)
          {
            matrix[thisRow][j] = PLACEHOLDER;
          }

          for (j = 0; j < colspan; j++)
          {
            // and empty for my columns
            matrix[thisRow][myColCount + j] = '';
          }
        }
      }
    }

    return matrix;
  }

  /*
   * Buttons for DataTables 2.0.1
   * ©2016-2021 SpryMedia Ltd - datatables.net/license
   */
  function stripData(str, config)
  {
    if (typeof str !== 'string')
    {
      return str;
    }

    str = str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    str = str.replace(/<!\-\-.*?\-\->/g, '');

    if (!config || config.stripHtml)
    {
      str = str.replace(/<[^>]*>/g, '');
    }

    if (!config || config.trim)
    {
      str = str.replace(/^\s+|\s+$/g, '');
    }

    if (!config || config.stripNewlines)
    {
      str = str.replace(/\n/g, ' ');
    }

    if (/^[0-9\s.,]+.?$/.test(str))
    {
      str = str.replace(/\s+/g, '');
    }

    if (!config || config.decodeEntities)
    {
      TEXTAREA.innerHTML = str;
      str = TEXTAREA.value;
    }

    return str;
  }

  /*
   * Buttons for DataTables 2.0.1
   * ©2016-2021 SpryMedia Ltd - datatables.net/license
   */
  function exportDataTable(dt, inOpts)
  {
    var config = $.extend(true, {}, {
      rows: null,
      columns: '',
      modifier: {
        search: 'applied',
        order: 'applied'
      },
      orthogonal: 'display',
      stripHtml: true,
      stripNewlines: true,
      decodeEntities: true,
      trim: true,
      format: {
        header: function(d)
        {
          return stripData(d, config);
        },
        footer: function(d)
        {
          return stripData(d, config);
        },
        body: function(d)
        {
          return stripData(d, config);
        }
      },
      customizeData: null
    }, inOpts);

    var header = getHeaders(dt, config);

    var footer = dt.table().footer()
      ? dt.columns(config.columns).indexes().map(function(idx)
        {
          var el = dt.column(idx).footer();

          return config.format.footer(el ? el.innerHTML : '', idx, el);
        }).toArray()
      : null;

    // If Select is available on this table, and any rows are selected, limit the export
    // to the selected rows. If no rows are selected, all rows will be exported. Specify
    // a `selected` modifier to control directly.
    var modifier = $.extend({}, config.modifier);

    if (dt.select && typeof dt.select.info === 'function' && modifier.selected === undefined)
    {
      if (dt.rows(config.rows, $.extend({selected: true}, modifier)).any())
      {
        $.extend(modifier, {selected: true});
      }
    }

    var rowIndexes = dt.rows(config.rows, modifier).indexes().toArray();
    var selectedCells = dt.cells(rowIndexes, config.columns);
    var cells = selectedCells
      .render(config.orthogonal)
      .toArray();
    var cellNodes = selectedCells
      .nodes()
      .toArray();

    var columns = header[0].length;
    var rows = columns > 0 ? cells.length / columns : 0;
    var body = [];
    var cellCounter = 0;

    for (var i = 0, ien = rows; i < ien; i++)
    {
      var row = [columns];

      for (var j = 0; j < columns; j++)
      {
        row[j] = config.format.body(cells[cellCounter], i, j, cellNodes[cellCounter]);
        cellCounter++;
      }

      body[i] = row;
    }

    var data = {
      header: header,
      footer: footer,
      body: body
    };

    if (config.customizeData)
    {
      config.customizeData(data);
    }

    return data;
  }

  return exportDataTable;
});
