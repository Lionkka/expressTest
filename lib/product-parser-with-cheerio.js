"use strict";

const fs = require('fs');
const request = require('request');
const cheerio = require('cheerio');

const userAgent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/58.0.3029.96 Chrome/58.0.3029.96 Safari/537.36';
const referer = 'http://www.ebay.com/sch/Cycling-/7294/i.html';

let headers = {
    'Referer': referer,
    'User-Agent': userAgent
};
let reqOptions = {
    headers: headers
};
const runParse = (url) => {
    reqOptions.url = url;
    console.log('runParse');
    return checkDir()
        .then(getPaginationUrls)
        .then(parsePages)
        .then(writeOutputFile)
        .catch((err) => console.log(err));
};
function parsePages(pagesUrls) {

    return Array.prototype.reduce.call(pagesUrls, (previousValue, currentPage) => {
        console.log('parsePages');
        return previousValue.then((pageDataList) =>
            getProductsUrls(currentPage)
                .then(getDataFromProducts)
                .then((pageData) => {
                    pageDataList.push(pageData);
                    return pageDataList;
                })
                .catch((err) => {throw err})
        );
    }, Promise.resolve([]));
}
function getPaginationUrls() {
    return new Promise((resolve, reject) => {
        console.log('getPaginationUrls');
        request(reqOptions, (err, res, body) => {
            if (err) reject(err);

            let $ = cheerio.load(body);
            let pagesUrls = $('a.pg');
            resolve(pagesUrls);

        });

    });

}
function checkDir() {
    return new Promise((resolve, reject) => {
        console.log('checkDir');
        fs.stat('cache', (err, stats) => {
            if (!stats) {
                fs.mkdir('cache', resolve)
            }
            else {
                resolve();
            }
        });
    });
}
function getDataFromProducts(productsUrls) {
    return Array.prototype.reduce.call(productsUrls, (previousValue, currentURL, index) => {
        return previousValue.then((productsDataList) =>
            getCache(currentURL)
                .then(makeProductReq)
                .then(parseProduct)
                .then(writeCache)
                .then((productsObj) => {

                        if (productsObj.hasOwnProperty('cache')) {
                            delete productsObj.cache;
                        }
                        productsDataList.push(productsObj);
                        return productsDataList;
                    }
                )
                .catch((err) => {throw err})
        );
    }, Promise.resolve([]));
}
function getProductsUrls(pageURL) {
    return new Promise((resolve, reject) => {
        reqOptions.url = pageURL.attribs.href;
        console.log('getProductsUrls', reqOptions.url);
        setTimeout(() => {

            request(reqOptions, (err, res, body) => {
                if (err) reject(err);

                let $ = cheerio.load(body);
                let productsUrls = $('#ListViewInner a');
                resolve(productsUrls);

            });
        }, 2000)
    });
}

function getCache(currentURL) {
    return new Promise((resolve, reject) => {

        let productID = currentURL.attribs.href.match(/\/[^\/]*\/(\d*)\?/)[1];

        console.log('getCache', productID);

        fs.stat('cache/' + productID + '.json', (err, stats) => {
            if (stats) {
                fs.readFile('cache/' + productID + '.json', ((err, data) => {
                    if (err) reject(err);
                    console.log('have cache. Reading');
                    try {
                        data = JSON.parse(data);
                    }
                    catch (error) {
                        resolve(currentURL)
                    }
                    data.cache = true;
                    resolve(data);
                }));
            }
            else resolve(currentURL);

        });
    });
}

function makeProductReq(productData) {
    return new Promise((resolve, reject) => {


        if (productData.hasOwnProperty('cache')) {
            resolve(productData);
        }
        else {
            setTimeout(() => {
                let productReqOption = {
                    url: productData.attribs.href,
                    headers: headers
                };
                console.log('makeProductReq',productReqOption.url);
                request(productReqOption, (err, res, productBody) => {
                    err
                        ? reject(err)
                        : resolve(productBody);
                });
            }, 2000);
        }
    });
}

function parseProduct(productBody) {
    return new Promise((resolve, reject) => {

        let $ = cheerio.load(productBody);
        if (productBody.hasOwnProperty('cache')) {
            resolve(productBody);
        }

        let title = $('.product-title').html();
        if(!title){
            title= $('#itemTitle').html().replace(/<span[^>]*>.*?<\/span>/,'');
        }

        let id = $('#descItemNumber').html();

        let price = $('#prcIsum_bidPrice').html();
        if (!price) {
            console.log('1!');
            price = $('#prcIsum').html();

            if (!price) {
                console.log('2!');
                price = $('#mm-saleDscPrc').html();
            }
            else price = null
        }


        let description = $('#desc_div').html();
        if (!description) {
            description = null;
        }

        let images = $('#vi_main_img_fs ul img');
        if (images) {
            images = Array.prototype.map.call(images, (item) => {
                return item.attribs.src.replace('s-l64.jpg', 's-l500.jpg');
            });
        }
        else {

            images = $('#icImg').html();
            if (!images) {
                images = null;
            }

        }

        resolve({
            id,
            title,
            price,
            description,
            images,
            timestamp: +new Date()
        });
    });
}

function writeCache(productObj) {
    return new Promise((resolve, reject) => {
        console.log('writeCache', productObj.id);

        if (productObj.hasOwnProperty('cache')) {
            resolve(productObj);
        }
        fs.writeFile('cache/' + productObj.id + '.json', JSON.stringify(productObj), (err) => {
            err
                ? reject(err)
                : resolve(productObj);
        })

    });
}

function writeOutputFile(productsData) {
    return new Promise((resolve, reject) => {

        console.log('writeOutputFile');
        fs.open('output.json', 'w', (err, fd) => {
            if (err) reject(err);

            fs.write(fd, JSON.stringify(productsData), (err) => {
                if (err) reject(err);
                console.log('done');
                resolve(productsData);
            })
        })
    });
}


module.exports = runParse;