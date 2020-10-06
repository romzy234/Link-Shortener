const express = require('express');
const Datastore = require('nedb');

/// Loading the database
const database = new Datastore('database.db');
database.loadDatabase();

// Intialing Express
const app = express();
const port = process.env.PORT || 80; 
app.listen(port , () => console.log(`Am running on port ${port}`))

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Post router 
// Send data to the database
app.post('/post', (req,res) =>{
    const detail =({
        name : req.body.name,
        entry : req.body.entry,
        redirect : req.body.redirect,
        count : 0
        
    })
    database.insert(detail);
    res.redirect('/sent');
});

// get router
// Homepage 
app.get('/', (req,res) =>{
    res.render('/index')
});

//Table of all Shortener create 
app.get('/route',(req,res,next) =>{
    { database.find({}, (err, data) =>{
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
    database.findOne({entry : req.params.id}, function(err, data){
        if(!data){
            res.send('Broken Link');
            return ;
        }else{
        database.update({ _id :req.body._id},{$inc: { count : 1 }},{upsert: true },function (err, data){
        });
        res.status(301).redirect(data.redirect);    
        }
    })
});

//Delete ShortCut
app.get('/delete/:id', (req,res)=>{
    database.remove({ _id : req.params.id }, {}, function (err, data) {
        if(err){
            res.send(' Something Broke');
        }
        res.redirect('/')
        });
});