const bodyParser = require("body-parser");
const express = require("express");
const Post=require('../models/posts');
const jwt = require('jsonwebtoken');
const verify=require('./jwtverify');
const multer =require('multer');
const formidable = require("formidable");
const  fs=require('fs');
const util=require('util')
const unlinkFile=util.promisify(fs.unlink)
 
const path = require('path');
var cookies = require("cookie-parser");
const { findOneAndUpdate } = require("../models/posts");
var ObjectId = require('mongodb').ObjectID;


const {uploadFile}=require("./s3")

//Sitemap updation
const {sitemapupdate}=require("./sitemap_update")


const app=express();

app.use(express.static("public"))

    
app.use(bodyParser.json());

app.use(cookies());
app.set('view engine', 'ejs');

const router = express.Router();
const upload=multer({dest:'uploads/'});


//Get all the posts Controller


router.get('/',async(req,res)=>{
   
    let pageno=req.query.pageno-1;
    let skippage=pageno*10;
try{

    const allPosts= await Post.find().sort({Post_Date:-1}).skip(skippage).limit(10);
     res.send(allPosts  )
}catch(err){
console.log(err);
}
});

router.get('/allposts',async(req,res)=>{
    try{

        const allPosts= await Post.find();
         res.send(allPosts);
    }catch(err){
    console.log(err);
    }
    
})
router.get('/getlength',async(req,res)=>{
    try{
        const postlength=await Post.count();
        res.status(200).send((postlength/10).toString());
    }catch(err){
        console.log(err);
    }
})

//Max views in all News
router.get('/maxviewedall',async(req,res)=>{
    try{
        var post=await Post.find( {
            "Post_Date": 
            {
                $gte: new Date((new Date().getTime() - (7* 24 * 60 * 60 * 1000)))
            }
        }).sort({Post_Views:-1}).limit(1);
        
        res.send(post);
    }catch(err){
        console.log(err);
    }
})

router.get('/fpostlength',async(req,res)=>{
    try{
        const postlength=await Post.find({Post_Category:req.query.pcategory}).count();
        res.status(200).send((postlength/10).toString());
    }catch(e){
        console.log(e);
    }
})

//Update deleted id 
router.post("/updateId",verify,async(req,res)=>{
    // console.log(req.body)
    try{
        doc = await Post.findOne({_id:req.body.newId})
        console.log(doc)
    const newPost = new Post({
        Post_Title:doc.Post_Title,
        Post_Description:doc.Post_Description, 
        Post_Place:doc.Post_Place,
        Post_Image:doc.Post_Image,
        Post_Category:doc.Post_Category,
        Post_Video_Link:doc.Post_Video_Link,
        Post_Keywords:doc.Post_Keywords
    })
   newPost._id = ObjectId(req.body.oldId);

  await newPost.save();
  await Post.deleteOne({_id: req.body.newId});
    res.send("succeed").status(200);
    }catch(err){
        console.log(err);
    }


})


// post Filtering by category
router.get('/fpost',async(req,res)=>{
    let pageno=req.query.pageno-1;
    let skippage=pageno*10;

    try{
        var post = await Post.find({Post_Category:req.query.pcategory}).sort({Post_Date:-1}).skip(skippage).limit(10);;
        res.send(post);
    }catch(err){
        console.log(err);
    }
})

//Max viewed news in perticular category
router.get('/maxviewed',async(req,res)=>{
    
    try{
        var post=await Post.findOne({
            $and:[
                {Post_Category:req.query.pcategory},
                { "Post_Date": 
                {
                    $gte: new Date((new Date().getTime() - (7* 24 * 60 * 60 * 1000)))
                }}
            ]
        }  ).sort({Post_Views:-1}).limit(1);
        res.send(post);
    }catch(err){
        console.log(err);
    }
})


//Get the specific post
router.get('/post',async(req,res)=>{
  
    try{    
        var post = await Post.findById(req.query.postid);
        
        res.send(post);

    }catch(err){
        console.log(err);
    }
})

//get latest 5 news


router.get("/top5",async(req,res)=>{
    var date = new Date();




    try{
        var post= await Post.find(
            {
                "Post_Date": 
                {
                    $gte: new Date((new Date().getTime() - (7 * 24 * 60 * 60 * 1000)))
                }
            }
        ).sort({Post_Views:-1}).limit(5);
        res.send(post);
    }catch(err){
        console.log(err);
    }
})



//Create Post 
router.post('/createPost',upload.single('image'),verify,async(req,res)=>{    
    const file=req.file

   const result= await uploadFile(file);
   
   await unlinkFile(file.path)

		const newPost = new Post({
                Post_Title:req.body.title,
                Post_Description:req.body.desc, 
                Post_Place:req.body.place,
                Post_Image:result.Location,
                Post_Category:req.body.category,
                Post_Video_Link:req.body.link,
                Post_Keywords:req.body.keywords
            })
            
            try{
                const savedPost= await newPost.save();
               //updating Sitemap
                sitemapupdate();

               res.send("Success")
               res.status(200)
          }catch(err){
           res.send(err);
          }
      

  


});

//Delete Specific Post Router

router.delete('/delete',verify,async(req,res)=>{
    console.log("Deleteing.....")

    try{

       const removePost= await Post.deleteOne({_id:req.body.postid});
        res.send("Deleted")
    

    }catch(err){
        console.log(err);
    }

})


//Incrementing view
router.patch('/incview',async(req,res)=>{
    
    try{
        
            const update=await Post.findOneAndUpdate({_id:req.body.id},{$inc:{Post_Views:1}});
            res.send("updated");
            res.status(200);     

    }catch(err){
console.log(err);
    }

})

router.patch('/updateimage',upload.single('image'),verify,async(req,res)=>{
   const file=req.file;
    const result= await uploadFile(file);
    await unlinkFile(file.path);

    try{
        const update=await Post.updateOne(
            {_id:req.body.id},
            {
                $set:{
                    Post_Image:result.Location
                }
            }
        );
        res.send("Updated")
        res.status(200);
        
    }catch(err){
        console.log(err);
    }


})

//Update specific Post

router.patch('/updatepost',verify,async(req,res)=>{
    try{
        
            const update=await Post.updateOne(
                {_id:req.body.id},
                {
                    $set:{
                        Post_Title:req.body.title,
                        Post_Description:req.body.desc,
                        Post_Place:req.body.place,
                        Post_Category:req.body.category,
                        Post_Video_Link:req.body.link,
                        Post_Keywords:req.body.keywords
                    }
                }
            );
            res.send("Updated")
            res.status(200);


    }catch(err){
        console.log(err);
    }

})





 module.exports = router;