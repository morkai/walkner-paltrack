define(function (require, exports, module) {// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under the MIT License <http://opensource.org/licenses/MIT>.
// Part of the h5.rql project <http://lukasz.walukiewicz.eu/p/h5.rql>

'use strict';

var Term = require('./Term');
var Query = require('./Query');
var Parser = require('./Parser');
var specialTerms = require('./specialTerms');
var valueConverters = require('./valueConverters');

/**
 * @type {Term}
 */
exports.Term = Term;

/**
 * @type {Query}
 */
exports.Query = Query;

/**
 * @type {Parser}
 */
exports.Parser = Parser;

/**
 * @type {object.<string, function>}
 */
exports.specialTerms = specialTerms;

/**
 * @type {object.<string, function>}
 */
exports.valueConverters = valueConverters;

/**
 * @type {Parser|null}
 */
exports.parser = null;

/**
 * @param {string} queryString
 * @returns {Query}
 */
exports.parse = function parseQueryStringToRqlQuery(queryString)
{
  if (exports.parser === null)
  {
    exports.parser = new Parser({
      jsonQueryCompatible: true,
      fiqlCompatible: true,
      allowEmptyValues: false,
      allowSlashedArrays: true,
      specialTerms: Object.keys(specialTerms)
    });
  }

  var query = new Query();
  var cachedSpecialTerms = {};

  query.selector = exports.parser.parse(queryString, cachedSpecialTerms);

  for (var specialTerm in cachedSpecialTerms)
  {
    if (cachedSpecialTerms.hasOwnProperty(specialTerm) && specialTerms.hasOwnProperty(specialTerm))
    {
      specialTerms[specialTerm](query, specialTerm, cachedSpecialTerms[specialTerm]);
    }
  }

  return query;
};

});
