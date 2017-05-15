"use strict";
//node lib/parser-index.js http://www.ebay.com/sch/Cycling-/7294/i.html

const productParser = require('./product-parser');
const url =  process.argv[2];

productParser(url);
