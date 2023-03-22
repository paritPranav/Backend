const mongoose = require("mongoose");



const advertiseSchema=new mongoose.Schema({

   Advertise_image:{
    type:String
   }
        
})

module.exports=mongoose.model('Advertise',advertiseSchema);