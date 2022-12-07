var express = require('express');
const mongoose = require("mongoose");
const multer = require("multer");
const upload = multer()
const Recipe = require("../models/Recipe");
const Category = require("../models/Category");
const Images = require("../models/Images");
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


router.get("/recipe/:food",(req,res,next)=>{
  Recipe.find({recipe: new RegExp(req.params.food,"i")},(err,recipe)=>{
    if(err) return next(err);
    if(recipe.length>0){
      return res.json(recipe[0]);
    }
    else{
      return res.status(404).send("Not found")
    }
  })
})

router.post("/recipe/",(req,res,next)=>{
  let categoryIDs = [];

  /*Getting all the categories from the recipe and adding to list*/ 
  req.body.categories.forEach((categoryname)=>{
    Category.find({name: categoryname},(err,category)=>{
      if(err) return next(err);
      if(category){
        categoryIDs.push(category[0].id)
      }
      else{
        return res.status(403).message("Categories not found");
      }
    })
  })

  /*Checking if recipe already exists*/ 
  Recipe.findOne({name: req.body.name},(err,name)=>{
    if(err) return next(err);
    if(!name){
      new Recipe({
        name: req.body.name,
        ingredients: req.body.ingredients,
        instructions: req.body.instructions,
        categories: categoryIDs,
        images: req.body.images
      }).save((err)=>{
        if(err) return next(err);
        return res.send({"message": "Recipe saved."})
      })
    }
    else{
      return res.status(403).send({"message": "Recipe already exists"})
    }
  })
})

router.post("/images",upload.array("images",12), async (req,res,next)=>{
  let ids = [];

  for(const image of req.files){
    
    const newimage = await new Images({
      buffer: image.buffer,
      mimetype: image.mimetype,
      name: image.originalname,
      encoding: image.encoding
    }).save()
    if(newimage){
      ids.push(newimage.id)
    }
  }

  return res.json({"ids": ids})
})



router.get("/category",(req,res,next)=>{
  Category.find({},(err,category)=>{
    if(err) return next(err);
    if(category){
      return res.json(category);
    }
    else{
      return res.status(403).message({"message": "Categories not found"});
    }
  })
})

router.get("/images/:imageId",(req,res,next)=>{
  
  Images.findById(req.params.imageId,(err,image)=>{
    if(err) return next(err);
    if(image){
      res.header({
        "Content-Type": "image/jpeg",
        "Content-Disposition": "inline"
      })
      res.send(image.buffer)
    }
    else{
      return res.status(403).message({"message": "Image not found"});
    }
  })
})

module.exports = router;