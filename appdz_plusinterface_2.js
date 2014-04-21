//MORE STUFF TO DO:
/*
-PUT THE APP UP ON HEROKU
-ALLOW SEARCHES TO RETURN MULTIPLE PAGES
-ALLOW SEARCHES TO HAVE AN UNSPECIFIED TIME PARAMETER
-LIMIT THE RANGE OF CERTAIN PARAMETERS, LIKE "MOOD"
-USE JAVASCRIPT/AJAX TO RETURN ALERTS, RATHER THAN "RES.SEND"'S
-IMPROVE THE FRONT-END/DESIGN COMPONENT
*/


/* EXPRESS */
var express = require('express');
// note Javascript has soft types 
var app = express();
// executes express as a function

var fs = require('fs');
//for reading images.

var http = require('http');
//for sending http server responses

// getting HTML to render, using  JADE;
// reference: http://goo.gl/4iqGh5
// app.set('public', __dirname + '/public');
// app.engine('html', require('ejs').renderFile);

// session store - require 'connect-mongo'



var db = require('./database/db.js');
var connect = db.connect;
var User = db.User; 
var Task = db.Task;

// use the following lines to deliver static pages
app.use(express.static(__dirname + '/public'));
app.use(express.compress());

app.use(express.bodyParser()); //apparently, this is bad for security. Use something else eventually.
app.use(express.urlencoded());
app.use(express.cookieParser());
app.use(express.session({secret: 'princeton'}));


//USE THIS TO RENDER DYNAMIC PAGES WITH EJS
app.set('view engine', 'ejs');



// Express session code goes here

connect.on('error', console.error.bind(console, 'Failed to open connection:'));
connect.once('open', function callback() {

    // intuitively APP.GET allows users to pull information from your server
    // note, '/' is the home page
    // REQ and RES are objects created when user connects - REQUEST and RESPOND

    /// NEW FEATURE ///

    //WHEN THE USER ENTERS THE /SIGNUP URL, THIS CODE RENDERS THE SIGNUP HTML PAGE,
    //which redirects us to the /signup post code.
    app.get('/signup', function(req, res){
        //for old code, see other versions
        res.redirect('../login');
    });

    app.get('/login', function(req, res){
        if (req.session.loggedIn){
            res.redirect('../home');
        } else {
            res.sendfile('./public/loginform.html');
        //from in the loginform.html, the user is sent to the localhost:8000/home url (look down)
        //GOES TO /HOME
        }
    });

    app.get('/', function(req, res){
        if (req.session.loggedIn){
            res.redirect('/home');
        } else {
            res.redirect('/login');
        }
    });

    //dbtest; taskdbtest...see other versions
    //THIS URL TESTS THE TASK DATABASE BY ADDING A NEW TASK.


    //GET HERE FROM "SIGN UP" HTML FORM
    //when successful, res.sends "signed up!"
    app.post('/signup', function(req, res){
        // var username = req.body.username;
        // var password = req.body.password;
        // console.log(username + " " + password);

        //search the database for the given username
        User.findOne({'username': String(req.body.username_init)}, 'firstname lastname password', function(err, user){
            if (!user) {
                //if the user is not in the database, sign them up.
                facebook = '';
                if (req.body.fb) {
                    facebook = req.body.fb;
                } 

                phone_number = '';
                if (req.body.phone_number) {
                    phone_number = req.body.phone_number;
                }

                email = '';
                if(req.body.email) {
                    email = req.body.email;
                }
                var newUser = new User({
                    "username": String(req.body.username_init),
                    "password": String(req.body.password_init),
                    "firstname": String(req.body.firstname),
                    "lastname": String(req.body.lastname),
                    "fb": facebook,
                    "email": email,
                    "phone_number": phone_number
                });

                // this creates a new user
                newUser.save(function (e){
                    if (e){
                        console.error.bind(console, 'Database error: failed to create user!')
                    }
                    else {
                        res.send(newUser.phone_number);
                        //Figure out how to do this without redirecting
                    }
                });
            } 

            else{ //the user is already in the database
                console.log(String(req.body.username));
                res.send('This username is already registered.');
            }
        });       

    });

    //Get to this page from "login.html" form
    //Is there a way to create an alert, which allows the user to stay on the same page?
    app.post('/authentication', function(req, res){
        
        //Create variable to contain string USER.FIRSTNAME
        var userFirstName = '';
        // var myObject = {};
        //console.log("This is the username: "+String(req.body.username));                
        
        //Checks credentials and renders the individual page
        User.findOne({'username': String(req.body.username)}, 'username firstname lastname password', function(err, user){
            // console.log(err); THIS DOESN'T WORK
            
            if (!user) {
                req.session.loggedIn = false;
                //res.redirect('../login');
                res.send("You are not a registered user here. Please sign up.")
            }
                //if the user is not in the database, say "not in database..."
                //when query fails to return a match, USER variable has value "null"
            
            else {
                if (String(req.body.password) === user.password) {
                    console.log('%s %s is in the database', user.firstname, user.lastname);
                    req.session.userID = String(user.username);
                    req.session.loggedIn = true;

                    req.session.userFirstName = String(user.firstname);

                    //if the password entered matches the user's password, bring the user to their homepage
                    res.redirect('../home');
                    
                } 
                
                else { //TRY TO CREATE AN ALERT HERE!! Wasn't able to.. :(
                    req.session.loggedIn = false;
                    //res.redirect('../login');
                    //res.send("Wrong password!");
                    
                    //Should(hopefully) get the jquery code in "loginform" to display an alert
                    res.send("wrong password!");
                    
                    //Try to create an alert; don't just redirect with "res.send..."
                }                
            }

        // page-rendering happens here
        if (!req.session.userFirstName) {} //this means that the user's password was incorrect; so do nothing.

        else{
            // console.log(myObject);
            //The User's password has matched
            //SEND THEM TO HOME SCREEN
            res.redirect('../home');
            //res.send('Hello, ' + userFirstName + '!');
        }


        });
        // var meme = User.findOne({'firstname': 'David'})
        // console.log(meme.select('username'));
    });


    app.get('/home', function(req, res){
        if (!req.session.loggedIn){
            res.redirect('../login');
        } else {
            Task.findOne({'username': String(req.session.userID)}, 'taskname rating', function(err, task){
                //search for any task from a given user, get back task name and rating.
                if(!task) {
                    //if the user has no tasks:
                    
                    //eventually, we will need to create a special page for this stuff.
                    /*
                    res.render('home', {
                        firstname: req.session.userFirstName,
                        taskname: "Enter new item at 'My Stuff' Page!"
                    });
                    */

                    res.send("Add a new task! The interface is coming soon!");
                }

                else {
                    //if a task was found:
                    //res.send('Hello, '+ userFirstName + ', your recommended task is: '+ String(task.taskname));

                    var taskQuery = Task.find({}, 'taskname rating durationmin durationmax mood description picture').sort({rating: 'desc'});
                    taskQuery.exec(function(err, docs){
                        // console.log('1')
                        
                        var testvar = docs; //.slice(0,5);
                        // console.log(testvar);
                        // console.log(docs[1].taskname);


                        // myObject = JSON.parse(JSON.stringify(docs));
                        // console.log('new myObject is ' + typeof(myObject));
                        // console.log(myObject);
                        // console.log(typeof(docs));
                        // console.log(docs);

                        var moods=[];                
                        var durations=[];
                        var ratings=[];
                        var usertasks=[];
                        var descriptions=[];
                        var pictures=[];
                        for (i=0; i<testvar.length; i++){
                            //TASKNAME
                            usertasks[i] = String(testvar[i].taskname);
                            
                            //RATING
                            if(!testvar[i].rating){
                                ratings[i] = "unspecified";
                            }
                            else {
                                ratings[i] = String(testvar[i].rating);
                            }
                            
                            //MIN AND MAX DURATIONS
                            if((!testvar[i].durationmin) && (!testvar[i].durationmax)) {
                                durations[i]="not specified";                                                
                            }
                            else {                        
                                durations[i] = String(testvar[i].durationmin)+" to "+String(testvar[i].durationmax)+" min";                        
                            }

                            //MOOD
                            if(!testvar[i].mood) {
                                moods[i] = "unspecified";
                                //console.log(moods[i], testvar[i].mood);
                            }
                            else {
                                moods[i] = String(testvar[i].mood);
                            }

                            //DESCRIPTIONS
                            if(!testvar[i].description) {
                                descriptions[i] = 'unspecified';
                            }
                            else {
                                descriptions[i] = String(testvar[i].description);
                            }

                            //PICTURE
                            if(!testvar[i].picture) {
                                pictures[i]='0';
                            }
                            else {
                                pictures[i] = String(testvar[i].picture);
                                //console.log(pictures[i]);
                            }

                            
                        }
                        // NOTE: the "correct" paradigm of JavaScript programming is to nest callback functions, which preserves variable scope, and functions that require those arguments inside of nested callback functions
                        res.render('home', {
                            firstname: req.session.userFirstName,
                            taskname: String(task.taskname),
                            tasklist: usertasks,
                            moodlist: moods,
                            ratinglist: ratings,
                            durationlist: durations,
                            descriptionlist: descriptions,
                            picturelist: pictures,
                        });
                    });

                    /*
                    res.render('home', {
                        firstname: req.session.userFirstName,
                        taskname: String(task.taskname)
                    });
                    */
                }
            });
        }
    });


    //TASKS PAGE OF THIS DOCUMENT WAS MODIFIED TO DISPLAY OTHER TASK ELEMENTS.
    //You can access this by links from the homepage, etc.
    app.get('/tasks', function(req, res) {
        // var myObject = [];

        if (!req.session.loggedIn){
            res.redirect('../login');
        } else {


        //Insert QUERY code here
        //FOR COLLIN: WHY CAN'T WE CREATE "USERTASKS" OUTSIDE OF TASKQUERY????
        //Answer: queries suck like that. Just actions inside queries as necessary.
            var taskQuery = Task.find({"username": String(req.session.userID)}, 'taskname rating durationmin durationmax mood description picture').sort({rating: 'desc'});
            taskQuery.exec(function(err, docs){
                // console.log('1')
                
                var testvar = docs; //.slice(0,5);
                // console.log(testvar);
                // console.log(docs[1].taskname);


                // myObject = JSON.parse(JSON.stringify(docs));
                // console.log('new myObject is ' + typeof(myObject));
                // console.log(myObject);
                // console.log(typeof(docs));
                // console.log(docs);

                var moods=[];                
                var durations=[];
                var ratings=[];
                var usertasks=[];
                var descriptions=[];
                var pictures = [];
                for (i=0; i<testvar.length; i++){
                    //TASKNAME
                    usertasks[i] = String(testvar[i].taskname);
                    
                    //RATING
                    if(!testvar[i].rating){
                        ratings[i] = "unspecified";
                    }
                    else {
                        ratings[i] = String(testvar[i].rating);
                    }
                    
                    //MIN AND MAX DURATIONS
                    if((!testvar[i].durationmin) && (!testvar[i].durationmax)) {
                        durations[i]="not specified";                                                
                    }
                    else {                        
                        durations[i] = String(testvar[i].durationmin)+" to "+String(testvar[i].durationmax)+" dollars";                        
                    }

                    //MOOD
                    if(!testvar[i].mood) {
                        moods[i] = "unspecified";
                        //console.log(moods[i], testvar[i].mood);
                    }
                    else {
                        moods[i] = String(testvar[i].mood);
                    }

                    //DESCRIPTIONS
                    if(!testvar[i].description) {
                        descriptions[i] = 'unspecified';
                    }
                    else {
                        descriptions[i] = String(testvar[i].description);
                    }

                    //PICTURES
                    if(!testvar[i].picture) {
                        pictures[i] = '0'
                    }
                    else {
                        pictures[i] = testvar[i].picture;
                    }

                    
                }
                // NOTE: the "correct" paradigm of JavaScript programming is to nest callback functions, which preserves variable scope, and functions that require those arguments inside of nested callback functions
                res.render('taskpage', {
                    tasklist: usertasks,
                    moodlist: moods,
                    ratinglist: ratings,
                    durationlist: durations,
                    descriptionlist: descriptions,
                    pictures: pictures
                });
            });
        }

        
    });

    /////// *** QUERY DEV CODE HERE *** ///////
    //see older versions
    
    //the tasks/create url is only for recieving "new task" requests
    app.post('/tasks/create', function(req,res){
        //use a query to check if the task already exists
        //if not, create it.
        //res.send("Coming soon!");

        //use a query to check if the task already exists
        var NewTask_Query = Task.findOne({"username": String(req.session.userID), "taskname":req.body.newtaskname.toLowerCase()}, 
            function(err, task){
            //search for the given task. If it is found, alert the user.
            if(task) {
                res.send("that task has already been created.");
            }
            else {
                //create a new task with the specified name, if we know it's not in the database.
                if(req.body.rating<0 || req.body.rating>5) {
                    res.send('Please keep ratings between 0 and 5.');
                }

                if(req.body.durationmin > req.body.durationmax) {
                    res.send('min duration should be less than max duration.');
                }

                
                img_data = fs.readFileSync(req.files.picture.path, "base64");
                //by default, the server reads the image data from the specified path and stores it as a buffer
                //a buffer is similar to an array of integers. It is used to store raw memory.                
                //b64_img_data = img_data.toString(base64);
                //here, we store the buffer as a base-64 string, which allows an html document to eventually parse it.

                var newTask = new Task({
                    "username": String(req.session.userID),
                    "taskname": String(req.body.newtaskname).toLowerCase(),
                    "rating": Number(req.body.rating),
                    "durationmin": Number(req.body.durationmin),
                    "durationmax": Number(req.body.durationmax),
                    "mood": String(req.body.mood).toLowerCase(),
                    "description": String(req.body.description),
                    "frequency": 0,
                    "picture": img_data,
                    "picture-ctype": String(req.files.picture.headers.contenttype)
                    //PICTURE-CTYPE DOES NOT STORE THE CONTENT TYPE OF THE FILE -________-
                    //ALSO, NOT SURE IF THIS WILL CONTINUE TO WORK IF THE APP IS LIVE?
                });


                //console.log(req.files);
                //var img = req.files.image;
                //console.log(req.body);
                //console.log(newTask.description+"\n"+newTask.picture);
                
                //does "newtask.picture" need to be converted to base-64? 
                res.writeHead(200, {'Content-Type': 'text/html'});
                //res.setHeader('content-type', 'text/html');
                res.write('<html><body><img src="data:image/jpeg;base64,');
                res.write(img_data);
                //a buffer (newTask.picture) is similar to an array of integers. It is used to store raw memory. We have to convert it to base64 for the html.
                
                res.end('"/></body></html>');                     

                newTask.save();
                /*
                newTask.save(function(e){
                    if(e){
                        console.error.bind(console, 'Database error: failed to create task.');
                    }

                    else {
                        //res.send("new task created!");
                        res.redirect('../');
                    }
                });
                */
            }
        });
        //if not, create it.
        //res.send("Coming soon!");
    });

    app.get('/tasks/create', function(req,res){
        res.redirect('../');
    });

    //the tasks/edit url is only for recieving "edit task" requests
    app.post('/tasks/edit', function(req, res){
        //res.send("coming soon!");

        var editTaskQuery = {'username': req.session.userID, 'taskname': req.body.editTaskName.toLowerCase()};

        Task.findOneAndRemove(editTaskQuery, function(err, task){            
            //for the rating, min and max durations, and moods, check if user changed value. If so, store changes in local vbls.
            if(!task) {
                res.send("Your task could not be found in the database.");
            }

            var editRating = task.rating;
            if(req.body.editRating) {
                if(req.body.editRating > 5 || req.body.editRating<0) {
                    res.send("all ratings should be between 0 and 5");
                    //eventually, this should become a javascript alert.
                }
                editRating = req.body.editRating;
            } 

            var editMinDuration = task.durationmin;
            if(req.body.editMinDuration) {
                editMinDuration = req.body.editMinDuration;
            }

            var editMaxDuration = task.durationmax;
            if(req.body.editMaxDuration) {
                editMaxDuration = req.body.editMaxDuration;
            }

            //verify that maxduration and minduration have the correct corresponding values:
            if(editMaxDuration < editMinDuration) {
                res.send('max duration must be greater than min duration');
            }

            if(task.mood){
                var editMood = task.mood.toLowerCase();
            }            
            if(req.body.editMood) {
                editMood = req.body.editMood.toLowerCase();
            }

            var editDescription = task.description;
            if(req.body.editDescription) {
                editDescription = req.body.editDescription;
            }
            
            var editPicture = task.picture;
            if(req.files.editPicture) {
                editPicture = fs.readFileSync(req.files.editPicture.path, "base64");
                //fs.synchronousreadfile finds the picture at the specified path and stores it as base-64 memory.
                //from there, we store the data in a string and send it to the html.
                //editPicture = req.body.editPicture;
            }

            
            //create a new "edited task" and store it in the database.
            editedTask = new Task({
                "username": req.session.userID,
                "taskname": task.taskname,
                "mood": editMood,
                "rating": editRating,
                "durationmax": editMaxDuration,
                "durationmin": editMinDuration,
                "frequency":task.frequency,
                "description": editDescription,
                "picture": editPicture
            });

            console.log(editedTask.description);

            editedTask.save(function (e){
                if (e){
                    console.error.bind(console, 'Database error: failed to edit task.');
                }
                else {
                    res.redirect('../');
                }
            });


        });
    });

    app.get('/tasks/edit', function(req, res){
        res.redirect('../');
    });


    //PAGE FOR MESSING AROUND WITH QUERIES
    //see previous versions.

    //this is the task search. It is important. Don't delete it.
    app.get('/recommender', function(req, res){
        if (!req.session.loggedIn){
            res.redirect('../login');
        } else {
            res.sendfile('./public/recommendform.html');
        }
    });

    app.post('/recommended', function(req, res){
        //posted data: userMood and userTime
        if (!req.session.loggedIn){
            res.redirect('../login');
        }
        //here we've confirmed that the user is logged in        

        var userMood = String(req.body.userMood);
        if (userMood) {
            userMood = userMood.toLowerCase();
            //^^to make the search robust, and not case-sensitive.
        }
        
        var userTime = 720; 
        //in case the user has not entered a time duration, assume he has 12 hours.
        if(req.body.userTime) {
            userTime = Number(req.body.userTime);
        }

        var numResults = 5;
        if(req.body.numResults) { //did the user enter anything?
            if(req.body.numResults > 0) { //did the user enter a positive number?
                numResults = req.body.numResults - (req.body.numResults % 1); //round.
            }
        }
        
        //THERE SHOULD PROBABLY BE A MORE EFFICIENT WAY TO MAKE A SEARCH WHERE CERTAIN PARAMS ARE NOT REQUIRED.
        if (req.body.userMood === '') {
            //if the user has not specified a mood, then no need to match based on the moods.
            var QueryRating = Task.aggregate(                
                {$match: {
                    //mood: userMood,
                    durationmin: {$lte: userTime}
                }}
            );
        }

        else{
            //if the user has specified a mood, then by all means use it to match.
            var QueryRating = Task.aggregate(                
                {$match: {
                    mood: userMood,
                    durationmin: {$lte: userTime}                   
                }}
            );
        }
            //IS IT POSSIBLE TO ADD A ".MATCH" TO "QUERYRATING" CONDITIONALLY?!?!?!?!?
           
            
            if (!QueryRating){
                res.send('No tasks found. Please try another search!');
            } else {
                //Once the aggregation is done, sort by rating
                QueryRating.group({_id: '$taskname', ratingAvg: {$avg: '$rating'}, minDurAvg: {$avg: '$durationmin'},
                    maxDurAvg: {$avg: '$durationmax'}, mood: {$first: '$mood'}, description: {$first: '$description'}})
                    .sort({ratingAvg: 'desc'}).exec(function(err, allResults){
                    //Inside the callback function, do another (user-specific) aggregation
                    var MyQuery = Task.aggregate([
                        {$match: {
                            username: String(req.session.userID),
                            mood: userMood,
                            durationmin: {$lte: userTime}
                            //durationmax: {$gte: userTime}
                        }},
                        {$group: {
                            _id: '$taskname',
                            ratingAvg: {$avg: '$rating'},
                            minDurAvg: {$avg: '$durationmin'},
                            maxDurAvg: {$avg: '$durationmax'},
                            mood: {$first: '$mood'},
                            description: {$first: '$description'}
                        }}
                    ]);

                    //Sort this query as well
                    MyQuery.sort({ratingAvg: 'desc'}).exec(function(err, myResults){
                        //Inside both callback functions
                        //Next define variables to pass to ejs render

                        console.log(myResults);
                        console.log(allResults);

                        var alltasks = [];
                        var allratings = [];
                        var alldurations = [];
                        var allmoods = [];
                        var alldescriptions = [];
                        var mytasks = [];
                        var myratings = [];

                        if (allResults.length > numResults){
                            allResults = allResults.slice(0, numResults);
                        }
                        if (myResults.length > 5){
                            myResults = myResults.slice(0,5);
                        }

                        //Populate list of rec's from all users
                        for (i=0; i<allResults.length; i++){
                            alltasks[i] = String(allResults[i]._id);
                            allratings[i] = Number(allResults[i].ratingAvg);

                            //DURATIONS
                            if((!allResults[i].minDurAvg) && (!allResults[i].maxDurAvg)) {
                                alldurations[i]="not specified";                                                
                            }
                            else {                        
                                alldurations[i] = String(allResults[i].minDurAvg)+" to "+String(allResults[i].maxDurAvg)+" min";                        
                            }

                            //MOOD
                            if(!allResults[i].mood) {
                                allmoods[i] = "unspecified";
                                //console.log(moods[i], testvar[i].mood);
                            }
                            else {
                                allmoods[i] = String(allResults[i].mood);
                            }

                            //DESCRIPTIONS
                            if(!allResults[i].description) {
                                alldescriptions[i] = 'unspecified';
                            }
                            else {
                                alldescriptions[i] = String(allResults[i].description);
                            }
                        }

                        //Populate list of rec's from this user
                        for (i=0; i<myResults.length; i++){
                            mytasks[i] = String(myResults[i]._id);
                            myratings[i] = Number(myResults[i].ratingAvg);
                        }

                        // res.send('Check your log!');

                        // console.log(alltasks);
                        // console.log(allratings);
                        console.log(mytasks);
                        console.log(myratings);


                        //***FINALLY*** render inside the callback function
                        res.render('recommendpage', {
                            listAll: alltasks,
                            rateAll: allratings,
                            durationAll: alldurations,
                            moodAll: allmoods,
                            descriptionAll: alldescriptions,
                            listMe: mytasks,
                            rateMe: myratings
                        });
                    });

                });
            }
            
    });


    //"get"s the url "/logout"; sets the 'logged in' parameter to false and displays the logout page.
    //all pages will contain links to this page.
    app.get('/logout', function(req, res){
        req.session.loggedIn = false;
        req.session.userID = '';
        res.sendfile('./public/logoutscreen.html');
    });



    // something more interactive
    // the COLON : is variable notation
    // note that this syntax is used all the time, e.g. Google, Facebook
    // app.get('/name/:myname', function(req, res){
    //     res.send('My name is ' + req.params.myname + '.')
    // });


    app.get('/makefounderdb', function(req, res){

        //"connect" contains the db export from db.js
        connect.db.dropCollection('tasks', function(err, result){});

        seedArray = [
            ["founder", "study", "productive", 2, 15, 45, 1],
            ["founder", "play Xbox", "fun", 4.5, 30, 180, 1],
            ["founder", "use Codecademy", "productive", 5, 10, 60, 1],
            ["founder", "surf the web", "relaxing", 4.2, 5, 180, 1],
            ["founder", "read the New York Times", "relaxing", 4.6, 10, 30, 1],
            ["founder", "call your parents", "productive", 4.9, 5, 20, 1],
            ["founder", "chat on tigersanonymous", "fun", 4.8, 0, 15, 1]
            ["bieber", "study", "productive", 4.4, 30, 90, 1],
            ["bieber", "use Codecademy", "productive", 5, 5, 90, 1],
            ["bieber", "call your parents", "productive", 3.5, 2, 20]
        ];

        //double-bracket reference to nested arrays is OK
        // for (j in seedArray){
        //     console.log(seedArray[j][1]);            
        // }

        for (j in seedArray){

            // console.log(seedArray[j][1]);
            // console.log(j);
            // var m = j;

            // Task.findOne({"username": "founder", "taskname": String(seedArray[j][1])}, "taskname", function(err, task){
            //     if (!task) {

                    var newTask = new Task({
                        "username": seedArray[j][0],
                        "taskname": seedArray[j][1],
                        "mood": seedArray[j][2],
                        "rating": seedArray[j][3],
                        "durationmin": seedArray[j][4],
                        "durationmax": seedArray[j][5],
                        "frequency": seedArray[j][6]
                    });
                    console.log(seedArray[j][1]);
                    // console.log(j);
                    // console.log(m);
                    console.log(newTask);

                    newTask.save(function(e){
                        if(e){
                            console.error.bind(console, 'Database error: failed to create task.');
                        } else {
                            console.log('New task created!');
                        }
                    });
                // }
            // });
        }
        //NOW ALL ENTRIES HAVE BEEN CREATED/SKIPPED

        res.send('Finished. Read the log and check mongo!');
    });
    
    /// ** DEV CODE **
    /// scan task database for all productive tasks
    /// then computes the average rating for all productive tasks
    /// and sorts by best rating
    app.get('/productive', function(req, res){

    });

});




app.listen(8000);
// this instructs the script to sit at "localhost:8000"
