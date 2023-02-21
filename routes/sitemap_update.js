const fs = require('fs');
const convert = require('xml-js');
const moment = require('moment');
// const fetch=require("node-fetch")    
const axios =require("axios")
const options = { compact: true, ignoreComment: true, spaces: 4 };

const getposturl="https://backend.spnews.live/posts/allposts";
const postUrl="https://spnews.live/fullpost";

untrackedUrlsList = [];

function fetchposts (){
    axios.get(getposturl)
        .then((res)=> {
            
            if (res.data) {
                res.data.forEach(element => {
                    let id=element._id;
                    untrackedUrlsList.push(`${postUrl}/${id}`);
                });
                filterUniqueURLs();
            }

        })
       
        .catch(error => {
            console.log(error);
        });
}

const filterUniqueURLs = () => {
    fs.readFile('sitemap.xml', (err, data) => {
        if (data) {
            const existingSitemapList = JSON.parse(convert.xml2json(data, options));
            console.log(existingSitemapList);
            let existingSitemapURLStringList = [];
            if (existingSitemapList.urlset && existingSitemapList.urlset.url && existingSitemapList.urlset.url.length) {
                existingSitemapURLStringList = existingSitemapList.urlset.url.map(ele => ele.loc._text);
            }
            console.log(existingSitemapURLStringList);

            untrackedUrlsList.forEach(ele => {
                if (existingSitemapURLStringList.indexOf(ele) == -1) {
                    existingSitemapList.urlset.url.push({
                        loc: {
                            _text: ele,
                        },
                        changefreq: {
                            _text: 'monthly'
                        },
                        priority: {
                            _text: 0.8
                        },
                        lastmod: {
                            _text: moment(new Date()).format('YYYY-MM-DD')
                        }
                    });
                }
            });
            createSitemapFile(existingSitemapList);
        }
    });
}






const createSitemapFile = (list) => {
    const finalXML = convert.json2xml(list, options); // to convert json text to xml text
    saveNewSitemap(finalXML);
}

const saveNewSitemap = (xmltext) => {
    fs.writeFile('sitemap.xml', xmltext, (err) => {
        if (err) {
            return console.log(err);
        }

        console.log("The file was saved!");
    });
}

exports.sitemapupdate=fetchposts;