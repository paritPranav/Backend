const number = require("@hapi/joi/lib/types/number");
const mongoose = require("mongoose");



const billSchema=new mongoose.Schema({

   Provider_Name:{
    type:String
   },
   adAmount:{
    type:Number
   },
   paymentStaus:{
    type:String
   },
   ad_Date:{
    type:Date,
    default:Date.now
    },
    adDuration:{
        type:Number
    }
        
})

module.exports=mongoose.model('AdvertiseBills',billSchema);