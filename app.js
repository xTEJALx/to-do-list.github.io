//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
// const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.connect("mongodb+srv://admin:qgZJm6aWS7DAWBre@cluster0.scmvtju.mongodb.net/?retryWrites=true&w=majority");
// const items = ["Buy Food", "Cook Food", "Eat Food"

const itemsSchema = {
  name: String,
};

const Item = mongoose.model("Item",itemsSchema);
const item1 = new Item({
  name: "Welcome to your todolist!"
});
const item2 = new Item({
  name:"Hit the + button to add a new item"
});
const item3 = new Item({
  name: "<--Hit this to delete an item."
});
const defaultItems = [ item1,item2,item3];

// Item.insertMany(defaultItems,function(err){
//   if(err){
//     console.log(error);
//   }else{
//     console.log("Saved");
//   }
// });
const listSchema = {
  name:String,
  items:[itemsSchema]
};

const List = mongoose.model("List",listSchema);

app.get("/", function(req, res) {

Item.find({},function(err,foundItems){
  if(foundItems.length === 0){
    console.log()
    Item.insertMany(defaultItems,function(err){
      if(err){
        console.log(err);
      }else{
        console.log("Saved");
      }
    });


  }
  res.render("list", {listTitle: "Today", newListItems: foundItems});
});
// const day = date.getDate();

});

app.post("/", function(req, res){

  const itemname = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name:itemname
  });
  if(listName === "Today"){
    item.save();
  res.redirect("/");
}else{
  List.findOne({name:listName},function(err,foundList){
    // console.log("listname="+listName);
    // console.log("foundlist="+foundList);
    foundList.items.push(item);
    foundList.save();
    res.redirect("/"+listName);
  });
}

});
app.post("/delete",function(req,res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName == "Today"){
    Item.findByIdAndRemove(checkedItemId,function(err){
      if(err){
        console.log(err);
      }
      res.redirect("/");
    });
  }else{
    List.findOneAndUpdate({name:listName},{$pull:{items: {_id:checkedItemId}}},function(err,foundOne){
      if(!err){
        res.redirect("/"+listName);
      }
    });
  }


});

// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });
//
// app.get("/about", function(req, res){
//   res.render("about");
// });
app.get("/:customListName",function(req,res){
  const customListName = _.capitalize(req.params.customListName);

   List.findOne({name : customListName},function(err,foundList){
     if(!err){
       if(!foundList){
         const list = new List({
           name: customListName,
           items: defaultItems
         });
       list.save();
       res.redirect("/"+customListName);
       }
       else{
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }
   });


});


app.listen(process.env.PORT || 3001, function() {
  console.log("Server started successfully");
});
