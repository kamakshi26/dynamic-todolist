const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require("mongoose");
var _ = require('lodash');
// const date=require(__dirname+"/date.js");

// console.log(date);
const app = express();

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));
app.set('view engine', 'ejs');
mongoose.connect("mongodb+srv://admin-kamakshi:Kamakshi@00@cluster0-n08gz.mongodb.net/todolistDB" , {useNewUrlParser: true});

// create work schema
const workSchema=new mongoose.Schema(
  {
    task : String
  }
);

// second document (listtype)
const listtypeSchema=mongoose.Schema(
  {
    name : String,
    values : [workSchema]
  }
);

 // works Array model
 const worksModel=new mongoose.model("work",workSchema);

 //list model
 const listmodel=mongoose.model("listType",listtypeSchema);

 // create default data for list
const data1=new worksModel(
  {
    task : "coding"
  }
);
const data2=new worksModel(
  {
    task : "aptitude"
  }
);
const data3=new worksModel(
  {
    task : "webdev"
  }
);
// array to store default values
const defaultvalues=[data1,data2,data3];



// handling get requests
app.get('/', function(req, res) {
   // let thisday=date.getday();

   worksModel.find({},function(err,foundItems)
 {
   if(foundItems.length===0)
   {
     worksModel.insertMany(defaultvalues, function(err)
     {
       if(err)
       {
         console.log(err);
       }
       else
       {
         console.log("successfully inserted");
       }
     });
     res.redirect('/');

   }

   else
   {
     res.render('list', {listtitle: "Today",  newValue: foundItems});
   }
 });

});


// handling post requests
app.post('/', function(req, res) {

  var value = req.body.extracurricular;
  const nameoflist=req.body.listname;
  const newData=new worksModel(
    {
      task : value
    }
  );


  if(nameoflist==="Today")
  {
  newData.save();
  res.redirect("/");
}
else{

  listmodel.findOne({name : nameoflist},function(err,found)
  {
    found.values.push(newData);
    found.save();
    res.redirect('/'+nameoflist);
  });
}
});


// handling get requests for different routes
app.get('/:parameter',function(req,res)
{
  const name_of_list=_.capitalize(req.params.parameter);
  listmodel.findOne({name : name_of_list}, function (err, docs) {
       if (docs){
           res.render('list',{listtitle: docs.name,  newValue: docs.values});
       }else{
         const newListname=new listmodel(
           {
             name : name_of_list,
             values:defaultvalues
           });
           newListname.save();
           res.redirect('/'+newListname.name);
         }

   });



});



// post route to delete data from database
app.post('/delete',function(req,res)
{
  const delId=req.body.checkbox;
  const listname=req.body.listName;
  if(listname==="Today")
  {
    worksModel.findByIdAndRemove(delId,function(err)
    {
      if(err)
      {
        console.log(err);
      }
      else
      {
        console.log("deleted");
      }
      res.redirect('/');
    });
  }
  else
  {
    listmodel.findOneAndUpdate({name : listname},{$pull:{values:{_id : delId}}},function(err,results)
  {
    if(!err){
      console.log("updated");
      res.redirect("/"+listname);
    }
  });
  }
});



// port listening
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}


app.listen(port, function() {
  console.log("server running");
});
