const express = require('express');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
const bodyParser = require('body-parser')
const methodOverride = require('method-override');
const expressSessions = require('express-session')
const app = express();


// Map global promises
mongoose.Promise = global.Promise;

// Connect to mongoose
mongoose.connect('mongodb://localhost/video-dev', {
    // useMongoClient: true, ..."this is no longer needed"
    useNewUrlParser: true
})
    .then(() => console.log('MongoDB connected....'))
    .catch(err => console.log(err));

// Load Models
require("./models/Idea");
const Idea = mongoose.model('ideas');

// Handlebars Middleware
app.engine('handlebars', exphbs({
    defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

// Body-Parser Middleware
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// Method-Override Middleware
app.use(methodOverride('_method'));

// Index Route
app.get('/', (req, res) => {
    const title = 'Welcome'
    res.render('index', {
        title: title
    });
});

// About Route
app.get('/about', (req, res) => {
    res.render('about');
});

// Idea Index Page
app.get('/ideas', (req, res) => {
    Idea.find({})
        .sort({ date: 'desc' })
        .then(ideas => {
            res.render('./ideas/index', {
                ideas: ideas
            });
        });

});

// Add Idea Form
app.get('/ideas/add', (req, res) => {
    res.render('ideas/add');
});

// Edit Idea Form
app.get('/ideas/edit/:id', (req, res) => {
    Idea.findOne({
        _id: req.params.id
    })
        .then(idea => {
            res.render('ideas/edit', {
                idea: idea
            });
        })

});

// Process Form
// Made empty array to hold errors
// That made if statements to say if there is no title or details to 
// push error message to the array. 
app.post('/ideas', (req, res) => {
    let errors = [];
    if (!req.body.title) {
        errors.push({ text: "Please Add A Title" });
    }
    if (!req.body.details) {
        errors.push({ text: "Please Add Details" });
    }
    
    //If errors is greater than 0 we want the user to get the error message to add input 
    if (errors.length > 0) {
        res.render('ideas/add', {
            errors: errors,
            title: req.body.title,
            details: req.body.details
        });
    
    // If all passes and errors is 0 than take the Idea and save and redirect
    } else {
        const newUser = {
            title: req.body.title,
            details: req.body.details
        }
        new Idea(newUser)
            .save()
            .then(idea => {
                res.redirect('/ideas');
            });
    }
});

// Edit Form Process
app.put('/ideas/:id', (req, res) => {
    // Takes model, uses method findOne to match params.id to the id from the DB
    // Then will allow us to edit the values and save them to that item
    // FInally will redirect us back to the ideas page
    Idea.findOne({
        _id:req.params.id
    })
    .then(idea => {
        // New Values to be saved
        idea.title = req.body.title;
        idea.details = req.body.details;

        idea.save()
            .then( idea => {
                res.redirect('/ideas')
            })
    });
});

// Delete Idea
app.delete('/ideas/:id', (req, res) => {
    Idea.remove({
        // Deleting idea that matches the id from params
        _id:req.params.id
    })
    .then( () => {
        // After redirect user back to ideas page
        res.redirect('/ideas')
    });

});

const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Server start locally on http://localhost:${PORT}`)
});

