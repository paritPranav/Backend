const mongoose = require("mongoose");



const postsSchema=new mongoose.Schema({

    Post_Title:{
        type:String,
        required:true
    },
    Post_Description:{
        type:String,
        required:true
    },
    Post_Place:{
        type:String,
        required:true
    },
    Post_Image:{
        type:String,
        required:true
        // data:Buffer,
        // contentType:String
    },
    Post_Category:{
        type:String,
        Required:true
    },
    Post_Views:{
        type:Number,
        default:0
    },
    Post_Date:{
        type:Date,
        default:Date.now
    },
    Post_Video_Link:{
        type:String
    },
    Post_Keywords:{
        type:String
    }

})

module.exports=mongoose.model('Posts',postsSchema);