var mongoose = require('mongoose');
//this imports the mongoose module
mongoose.connect('mongodb://localhost/mydata');
var db = mongoose.connection;
exports.connect = db;

var Schema = mongoose.Schema; //this isn't really necessary, just nice

var userSchema = Schema({
	"username": String,
	"password": String,
    "firstname": String,
    "lastname": String,
    "fb": String,
    "email": String,
    "phone_number": String
    //NOT SURE IF THIS IS ALLOWED
    /*
    "tasks":[
    	"task": {
    		"rating": int,
    		"duration-min": int,
    		"duration-max": int
    	}
    ]
    */
	//use quotes around fields like "username", because it's safer
});

//another idea...
var taskSchema = Schema({
	"username": String,
	"taskname": String,
    "mood": String,
	"rating": Number,
	"durationmin": Number,
	"durationmax": Number,
    "description": String,
    "frequency": Number,
    "picture": String,
    "picture-ctype": String
});

//SIDE NOTE: WTF IS A BUFFER???


//schema is the structure for your data
//you can create several schemas within your database for different kinds of data
//collections: contains one kind of data; several per database

var User = mongoose.model('User', userSchema);
//model gives us an object (User) which has functions that allow us to create, destroy "user" objects

exports.User = User;


var Task = mongoose.model('Task', taskSchema);
exports.Task = Task;

//User.find({username:"sid"});
//mongoose.model gives you the User object, which has the "find" method. 
//User.findOne
//User.findAndRemove
//User.update
//User.save
//etc...
//CRUD: Create, retrieve, update and destroy: mongo usually has these functions built in.