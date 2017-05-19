"use strict";
const express = require('express');
const router = express.Router();
const parser = require('../lib/product-parser');

router.post('/', getParsedData);

function getParsedData(req, res, next) {

    let url = req.body.url;
    parser(url)
        .then((data) => {
            res.send(data);
        });

}

module.exports = router;