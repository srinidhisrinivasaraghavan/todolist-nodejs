var express = require('express');
var router = express.Router();
var path = require('path');
var User = require.main.require('./models/user');
var Folder = require.main.require('./models/folder');
var dbConfig = require.main.require('./db');
var mongoose = require('mongoose');
// Connect to DB
var cookieParser = require('cookie-parser');
mongoose.connect(dbConfig.url);
var session = require('express-session');


//Home
router.get('/', function(req, res) {
  console.log("call to index...");
  if(req.session.email==null){
  res.render('index');
}else
{
  Folder.find({email:req.session.email}, function(err, folders) {
  if (err) throw err;

  // object of all the users
  console.log(folders);
  res.render('folders', {folders:folders});
});

}
});




//Logout
router.get('/signout', function(req, res) {
  console.log("call to index...");
  req.session.destroy();
  res.render('index');
});




//Sign Up
router.post('/signup', function(req, res) {
console.log("call to signup post");
var un = req.body.email;
var pwd =req.body.password;

User.findOne({ email: un }, function(err, user) {
  if (err) throw err;
  else
  {
  	if(user==null)
  	{

  		var newUser = User({email:  req.body.email,
  					  password: req.body.password
  					});
		// save the user
		newUser.save(function(err) {
  		if (err) throw err;
  			console.log('User created!');
		});
		res.render('index',{"message" :"Create User Successfully. Please Login"});
  	}
  	else
  	{	console.log("user exists");
		res.render('index',{"message" :"User already exists."})
  	}
  }
});
});




//Sign In
router.post('/signin', function(req, res) {
console.log("call to signin post");
var un = req.body.email;
var pwd =req.body.password;
var exists= User.findOne({ email: un , password:pwd }, function(err, user) {
  if (err) throw err;
  else
  {
  	if(user==null)
  	{
		res.render('index',{"message" :"Login Failed"});
  	}
  	else
  	{	req.session.email=un;
  		console.log("user exists");

  		Folder.find({email:un}, function(err, folders) {
  if (err) throw err;

  // object of all the users
  console.log(folders);
  res.render('folders', {folders:folders});
});
		
  	}
  }
});
});



//Get Folders
router.get('/folders', function(req, res) {
	console.log("call to folders.."+req.session.email);
if(req.session.email!=null){

   Folder.find({email:req.session.email}, function(err, folders) {
  if (err) throw err;

  // object of all the users
  console.log(folders);
  res.render('folders', {folders:folders});
});

}
else
{
  res.render('index',{"message" :"Login to continue"});
}
});




//Create Folders
router.post('/folders', function(req, res) {
	var name = req.body.folderName;
  if(req.session.email!=null){
Folder.findOne({ name: name }, function(err, folder) {
  if (err) throw err;
  else
  {
  	if(folder==null)
  	{
var email=req.session.email;
  		var newFolder = Folder({
              name:name,
  					  email:email,
  					  created: Date(),
              tasks: []
  					});
		// save the user
		newFolder.save(function(err) {
  		if (err) {console.log(err); throw err;} 
  			console.log('Folder created!!');
		});
		  		Folder.find({email:req.session.email}, function(err, folders) {
  if (err) throw err;

  res.render('folders', {folders:folders});
});
  	}
  	else
  	{	console.log("folder exists");
		res.render('folders',{"message" :"Folder name already exists."})
  	}
  }
});
}
else
{
  res.render('index',{"message" :"Login to continue"});
}
});

//Delete Folder
router.get('/folders/delete/:folderName?', function(req, res) {
	console.log("call to tasks.."+req.params.folderName);
  if(req.session.email!=null){
  	Folder.remove({ email: req.session.email, name:req.params.folderName }, function(err) {
    if (err) {
          console.log("Error in delete"+err);  
    }
    else {
    	Folder.find({email:req.session.email}, function(err, folders) {
  if (err) throw err;

  res.render('folders', {folders:folders});
});
            
    }
});
  }
  else
{
  res.render('index',{"message" :"Login to continue"});
}

});


//Get Tasks of a folders
router.get('/folders/:folderName?', function(req, res) {
  if(req.session.email!=null){
	console.log("call to tasks.."+req.params.folderName);
  	
    	Folder.findOne({email:req.session.email, name:req.params.folderName }
    		, function(err, folder) {
  				if (err) throw err;
console.log(folder);
  				res.render('tasks', {folder:folder});
});
    }
     else
{
  res.render('index',{"message" :"Login to continue"});
}

});

//Create Tasks
router.post('/tasks/:foldername', function(req, res) {
  if(req.session.email!=null){
  var email=req.session.email;
	console.log("call to create tasks.."+req.params.foldername+req.body.taskName);

  Folder.findOneAndUpdate( { email:req.session.email, name:req.params.foldername }, {$push: {"tasks": {tname: req.body.taskName}}},
   {new: true},
    function(err, folder) {
  if (err){
    console.log("Error on task save "+err); throw err;
  }
// we have the updated user returned to us
console.log("Updated "+folder);
res.render('tasks', {folder:folder});
  });}
      else
{
  res.render('index',{"message" :"Login to continue"});
} 
});

//Delete tasks
router.get('/folders/delete/:folderName/:taskName', function(req, res) {
if(req.session.email!=null){
  var temail =req.session.email;
  console.log("call to delte tasks......"+temail+req.params.folderName+req.params.taskName);



  Folder.findOneAndUpdate( { email:temail, name:req.params.folderName }, {$pull: {"tasks": {tname: req.params.taskName}}},
   {new: true},
    function(err, folder) {
  if (err){
    console.log("Error on task save "+err); throw err;
  }


// we have the updated user returned to us
console.log("Updated "+folder);
res.render('tasks', {folder:folder});
  }); 
    }
     else
{
  res.render('index',{"message" :"Login to continue"});
}    
});

module.exports = router;
