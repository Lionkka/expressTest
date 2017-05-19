"use strict";

const fs = require('fs');
const request = require('request');
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
    let pagesData = [];
    return pagesUrls.reduce((previousValue, currentPage, index) => {
        console.log('parsePages');
        return previousValue.then(() =>
                getProductsUrls(currentPage)
                    .then(getDataFromProducts)
                    .then((pageData) => {
                        pagesData.push(pageData);
                        return pagesData;
                    })
                    .catch((err) => console.log(err))
            );
    }, Promise.resolve());
}
function getPaginationUrls() {
    return new Promise((resolve, reject) => {
        console.log('getPaginationUrls');
        request(reqOptions, (err, res, body) => {
            if (err) reject(err);

            body.replace(/\s{2,}/g, '');

            const paginationURLsRegex = /<a.+?class="pg.+?href="([^"]+)"/g;

            let pagesUrls = body.match(paginationURLsRegex);
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
    let productsData = [];
    return productsUrls.reduce((previousValue, currentURL, index) => {
        return previousValue.then(() =>
            getCache(currentURL)
                .then(makeProductReq)
                .then(parseProduct)
                .then(writeCache)
                .then((productsObj) => {

                        if (productsObj.hasOwnProperty('cache')) {
                            delete productsObj.cache;
                        }
                        productsData.push(productsObj);
                        return productsData;
                    }
                )
                .catch((err) => console.log(err))
        );
    }, Promise.resolve());
}
function getProductsUrls(pageURL) {
    return new Promise((resolve, reject) => {
        reqOptions.url = pageURL.match(/<a.+?class="pg.+?href="([^"]+)"/)[1];
        console.log('getProductsUrls', reqOptions.url);
        setTimeout(()=>{

            request(reqOptions, (err, res, body) => {
                if (err) reject(err);

                const productUrlRegex = /lvtitle[^<]*<a href="([^"]*)"/g;
                let productsUrls = body.match(productUrlRegex);
                resolve(productsUrls);

            });
        },2000)
    });
}

function getCache(currentURL) {
    return new Promise((resolve, reject) => {

        let productID = currentURL.match(/itm\/[^\/]*\/(\d*)\?/)[1];

        console.log('getCache', productID);

        fs.stat('cache/' + productID + '.json', (err, stats) => {
            if (stats) {
                fs.readFile('cache/' + productID + '.json', ((err, data) => {
                    if (err) reject(err);
                    data = JSON.parse(data);
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

        console.log('makeProductReq');

        if (productData.hasOwnProperty('cache')) {
            resolve(productData);
        }
        else {
            setTimeout(() => {
                productData = productData.slice(18, -1);
                let productReqOption = {
                    url: productData,
                    headers: headers
                };

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

        if (productBody.hasOwnProperty('cache')) {
            resolve(productBody);
        }

        productBody = productBody.replace(/\s{2,}/g, '');
        let title = productBody.match(/id="itemTitle">[^>]*>[^>]*>(.*?)<\/h1>/)[1];

        let id = productBody.match(/id="descItemNumber"[^>]*>([^<]*)<\/div>/)[1];
        console.log('parse', id);

        let price = productBody.match(/id="prcIsum_bidPrice"[^>]*>([^<]*)/);
        if (!price) {
            price = productBody.match(/id="prcIsum"[^>]*>([^<]*)/)
        }
        if (!price) {
            price = productBody.match(/id="mm-saleDscPrc"[^>]*>([^<]*)/)
        }
        if (price) {
            price = price[1]
        }
        else price = null;


        let description = productBody.match(/<(\w*) id="desc_div"[^>]*>([^\1]*?)\1>/);
        description
            ? description = description[2].slice(0, -2)
            : description = null;

        let images = productBody.match(/vi_main_img_fs_slider.*?ul.*?<\/ul>/);
        if (images) {
            images = images[0]
                .match(/img src="([^"]*)/g)
                .map(item => {
                    item = item.replace('s-l64.jpg', 's-l500.jpg')
                        .slice(9);
                    return item;
                });
        }
        else {
            images = productBody.match(/id="icImg".*?src="([^"]*)/);
            images
                ? images = [images[1]]
                : images = null;

        }

        resolve({
            id: id,
            title: title,
            price: price,
            description: description,
            images: images,
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
        fs.open('cache/' + productObj.id + '.json', 'w', (err, fd) => {
            if (err) reject(err);
            fs.write(fd, JSON.stringify(productObj), (err) => {
                err
                    ? reject(err)
                    : resolve(productObj);
            })
        });

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