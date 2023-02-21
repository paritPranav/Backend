const fs = require('fs');
const convert = require('xml-js');
const moment = require('moment');
// const fetch=require("node-fetch")    
const axios =require("axios")
getposturl="https://backend.spnews.live/posts/allposts";
postUrl="https://spnews.live/fullpost";

untrackedUrlsList = [];

function fetchposts (){
    axios.get(getposturl)
        .then((res)=> {
            console.log(res.data);
            if (res.data) {
                res.data.forEach(element => {
                    let id=element._id;
                    untrackedUrlsList.push(`${getposturl}/${id}`);
                });
                untrackedUrlsList.forEach(element=>{
                    console.log(element);
                })
            }

        })
       
        .catch(error => {
            console.log(error);
        });
}

exports.sitemapupdate=fetchposts;