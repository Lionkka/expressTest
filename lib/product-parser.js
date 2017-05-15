"use strict";

const fs = require('fs');
const request = require('request');
const userAgent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/58.0.3029.96 Chrome/58.0.3029.96 Safari/537.36';
const referer = 'http://www.ebay.com/sch/Cycling-/7294/i.html';

let headers = {
    'Referer': referer,
    'User-Agent': userAgent
};

const runParse = (url)=>{
    let reqOptions = {
        url: url,
        headers: headers
    };

    fs.stat('cache', (err, stats) => {
        if (!stats) {
            fs.mkdir('cache', () => {
                parseCatalogPage(reqOptions);
            })
        }
        else parseCatalogPage(reqOptions);
    });
};


function parseCatalogPage(reqOptions) {
    request(reqOptions, (err, res, body) => {
        if (err) throw err;

        let productUrlRegex = /lvtitle[^<]*<a href="([^"]*)"/g;
        let productsUrls = body.match(productUrlRegex);
        let productsData = [];

        productsUrls.reduce((previousValue, currentURL, index, arr) => {
            return previousValue.then(() =>
                    checkCache(currentURL)
                        .then(getCache)
                        .then((cacheData)=>{
                                if(cacheData) {
                                    productsData.push(cacheData);
                                    delete productsUrls[index];
                                }
                                if(index === productsUrls.length-1) makeReq();
                                return true;
                            })
                        .catch((err) => console.log(err))
                );
        }, Promise.resolve());

        const makeReq = ()=>{
            productsUrls.reduce((previousValue, currentURL, index, arr) => {

                return previousValue.then(() =>
                    makeProductReq(currentURL)
                        .then(parseProduct)
                        .then(writeCache)
                        .then((productObj) => {
                            productsData.push(productObj);
                            if (index === productsUrls.length - 1) {
                                writeOutputFile(productsData);
                            }

                        }).catch((err) => console.log(err))

                );
            }, Promise.resolve());
        }
    });
}
function getCache(productID) {
    return new Promise((resolve, reject) => {
        console.log('getCache', productID);
        if (productID) {

            fs.readFile('cache/' + productID + '.json', ((err, data) => {
                if (err) reject(err);
                resolve(JSON.parse(data));
            }));
        }
        else resolve();
    });
}
function checkCache(currentURL) {
    return new Promise((resolve, reject) => {
        let productID = currentURL.match(/itm\/[^\/]*\/(\d*)\?/)[1];

        fs.stat('cache/' + productID + '.json', (err, stats) => {
            if(stats) resolve(productID);
            else resolve(false);
        });

    });
}
function writeOutputFile(productsData) {
    fs.open('output.json', 'w', (err, fd) => {
        if (err) throw err;

        fs.write(fd, JSON.stringify(productsData), () => {
            console.log('done');
        })
    })
}
function makeProductReq(productURL) {
    return new Promise((resolve, reject) => {

        setTimeout(() => {
            productURL = productURL.slice(18, -1);
            let productReqOption = {
                url: productURL,
                headers: headers
            };

            request(productReqOption, (err, res, productBody) => {
                err
                    ? reject(err)
                    : resolve(productBody);
            });
        }, 2000);
    });
}
function parseProduct(productBody) {
    return new Promise((resolve, reject) => {

        productBody = productBody.replace(/\s{2,}/g, '');
        let title = productBody.match(/id="itemTitle">[^>]*>[^>]*>(.*?)<\/h1>/)[1];

        let id = productBody.match(/id="descItemNumber"[^>]*>([^<]*)<\/div>/)[1];
        console.log('req', id);

        let price = productBody.match(/id="prcIsum_bidPrice"[^>]*>([^<]*)/);
        if(!price) {
            price = productBody.match(/id="prcIsum"[^>]*>([^<]*)/)
        }
        if(!price) {
            price = productBody.match(/id="mm-saleDscPrc"[^>]*>([^<]*)/)
        }
        if(price){
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
            timestamp: new Date()
        });
    });
}
function writeCache(productObj) {
    return new Promise((resolve, reject) => {

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

module.exports = runParse;