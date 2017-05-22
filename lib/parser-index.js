"use strict";
//node lib/parser-index.js http://www.ebay.com/sch/Cycling-/7294/i.html

const productParser = require('./product-parser-with-cheerio');
const url =  process.argv[2];

productParser(url)
    .then(()=> console.log('done'))
    .catch((err)=> console.log(err));
