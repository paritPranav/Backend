const bodyParser = require("body-parser");
const express = require("express");
const Advertise=require('../models/advertisements');
const jwt = require('jsonwebtoken');
const verify=require('./jwtverify');
const multer =require('multer');
const formidable = require("formidable");
const  fs=require('fs');
const util=require('util')
const unlinkFile=util.promisify(fs.unlink)
 
const path = require('path');
var cookies = require("cookie-parser");

const {uploadFile}=require("./s3")


const app=express();
app.use(express.static("public"))


// app.use(express.static("public"))

    
app.use(bodyParser.json());

app.use(cookies());
// app.set('view engine', 'ejs');

const router = express.Router();
const upload=multer({dest:'uploads/'});


router.get("/",async(req,res)=>{
try{
    const alladvertisement=await Advertise.find();
    res.send(alladvertisement);

}catch(err){
    console.log(err);
}

})


router.post("/addadvertise",upload.single('image'),verify, async(req,res)=>{
    const file=req.file;
    const result=await uploadFile(file);
    await unlinkFile(file.path)

    const newAdvertise=new Advertise({

        Advertise_image:result.Location
    
    })
    try{
       let data= await newAdvertise.save();
        res.send(data);
        res.status(200);
    }catch(err){
       res.send(err);
    }

})

router.delete("/deleteAdvertise",verify,async(req,res)=>{
    try{
        const removeadvertise=await Advertise.deleteOne({_id:req.body.id});
        console.log(removeadvertise)
        if(removeadvertise.deletedCount){
            res.send("Deleted");
        }else{
            res.send("Not Deleted")
        }
    }catch(err){
        console.log(err);
    }

})
module.exports = router;
