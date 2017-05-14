"use strict";
const express = require('express');
const app = express();
app.use(require('express-session')({secret: 'keyboard cat', resave: true, saveUninitialized: true}));
const fs = require('fs');
const userAgent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/58.0.3029.96 Chrome/58.0.3029.96 Safari/537.36';
let referer = 'http://www.ebay.com/sch/i.html?_from=R40&_trksid=p2050601.m570.l1313.TR0.TRC0.H0.XSneaks.TRS0&_nkw=Sneaks&_sacat=0';
const request = require('request');

let headers = {
    'Referer': referer,
    'User-Agent': userAgent
};
let reqOptions = {
    url: 'http://www.ebay.com/sch/i.html?_from=R40&_trksid=p2057253.m570.l1313.TR0.TRC0.H0.XSneaks.TRS0&_nkw=Sneaks&_sacat=0',
    //url:'http://www.ebay.com/itm/City-Sneaks-Womans-Canvas-Gray-Tennis-Sneakers-Size-5-5-/132184656451?hash=item1ec6d1ca43:g:NwAAAOSwsN9XB-3x',
    headers: headers
};

fs.stat('cache',(err, stats)=>{
    if(!stats){
        fs.mkdir('cache', ()=>{
            parseCatalogPage(reqOptions);
        })
    }
    else parseCatalogPage(reqOptions);
});

function parseCatalogPage(reqOptions) {
    request(reqOptions, (err, res, body) => {
        if (err) throw err;

        let productUrlRegex = /lvtitle[^<]*<a href="([^"]*)"/g;
        let productsUrls = body.match(productUrlRegex);

        let productsPromises = productsUrls.reduce((previousValue, currentURL, index, arr) => {
            currentURL = currentURL.slice(18, -1);
            let promi = new Promise((resolve, reject) => {
                let productReqOption = {
                    url: currentURL,
                    headers: headers
                };

                setTimeout(() => {
                    console.log('timeout');

                    request(productReqOption, (err, res, productBody) => {

                        if (err) throw reject(err);
                        productBody = productBody.replace(/\s{2,}/g, '');

                        let title = productBody.match(/id="itemTitle">[^>]*>[^>]*>(.*?)<\/h1>/)[1];
                        let price = productBody.match(/id="prcIsum_bidPrice"[^>]*>([^<]*)/);
                        !price
                            ?price = productBody.match(/id="prcIsum"[^>]*>([^<]*)/)[1]
                            :price = price[1];

                        let description = productBody.match(/<(\w*) id="desc_div"[^>]*>([^\1]*?)\1>/)[2].slice(0, -2);
                        let images = productBody.match(/vi_main_img_fs_slider.*?ul.*?<\/ul>/)[0]
                            .match(/img src="([^"]*)/g)
                            .forEach(item => {
                                item = item.replace('s-l64.jpg', 's-l500.jpg');
                                return item.slice(9);
                            });
                        let id = productBody.match(/id="descItemNumber"[^>]*>([^<]*)<\/div>/)[1];
                        console.log(id);
                        let productDataJSON = JSON.stringify({
                            id: id,
                            title: title,
                            price: price,
                            description: description,
                            images: images
                        });

                        fs.open('cache/' + id + '.json', 'w', (err, fd) => {
                            if (err) reject(err);
                            fs.write(fd, productDataJSON, (err) => {
                                if (err) reject(err);
                                resolve(productDataJSON);
                            })
                        });
                    });

                }, 4000)
            });
            arr.push(promi);

            return arr;
        }, []);
        setTimeout(() => {
            // Promise.all(productsPromises)
            //     .then((productData) => fs.writeFile('output.json', productData.toString()))
            //     .catch((err) => console.log(err));
            productsPromises.reduce((previousValue, currentURL, index, arr)=>{
                //console.log(currentURL);
                // currentURL()
                //     .then((productData)=>
                //     arr.push(productData)
                //     )
                //     .catch(err=>console.log(err));
                return arr;
            },[]);
        }, 2000)

    });
}
