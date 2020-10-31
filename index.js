const express = require('express');
var path = require('path');
// For FORM input
var bodyParser = require('body-parser');
const Datastore = require('nedb');
// bodypaser 
/// Loading the database
const database = new Datastore('database.db');
database.loadDatabase();

// Intialing Express
const app = express();
const port = process.env.PORT || 80; 
app.listen(port , () => console.log(`Am running on port ${port}`));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Body parser For forms Actions 
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

// Post router 
// Send data to the database
app.post('/post', (req,res) =>{
    const detail =({
        Ename : req.body.Ename,
        entry : req.body.entry,
        redirect : req.body.redirect,
        count : 0   
    });
    database.insert(detail);
    res.redirect('/done');
});

// get router
// Homepage 
app.get('/', (req,res) =>{
    res.render('index');
});

//Table of all Shortener create 
app.get('/route',(req,res,next) =>{
    {database.find({}).sort({}).exec(function(err, data){
        if(err){
            res.status(500);
        }
      res.render('route',{
        data : data
    });
    })};    
});

// Shortened Link
app.get('/r/:id',(req,res)=>{
    var enrtyLink = req.params.id;
    database.findOne({entry : enrtyLink}, function(err, data){
        if(!data){
            res.send('Broken Link');
            return ;
        }else{
        res.status(301).redirect(data.redirect);
        database.update({ entry :enrtyLink},{$inc: { count : 1 }},{upsert: true },function (err, data){
        });
        }
    })
});

//Delete Shortened Link
app.get('/delete/:id', (req,res)=>{
    database.remove({ _id : req.params.id }, {}, function (err, data) {
        if(err){
            res.send(' Something Broke');
        }
        res.redirect('/route')
        });
});

// Action when a link has be added to the db
app.get('/done', (req,res) =>{
    res.redirect('/route')
});
