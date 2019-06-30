const express = require('express');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
const bodyParser = require('body-parser')

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
const idea = mongoose.model('ideas');

// Handlebars Middleware
app.engine('handlebars', exphbs({
    defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

// Body-Parser Middleware

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

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

// Add Idea Form
app.get('/ideas/add', (req, res) => {
    res.render('ideas/add');
});

// Process Form
app.post('/ideas', (req, res) => {
    let errors = [];
    if (!req.body.title) {
        errors.push({ text: "Please Add A Title" });
    }
    if (!req.body.details) {
        errors.push({ text: "Please Add Details" });
    }

    if (errors.length > 0) {
        res.render('ideas/add', {
            errors: errors,
            title: req.body.title,
            details: req.body.details
        });
    } else {
        res.send('passed');
    }
});

const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Server start locally on http://localhost:${PORT}`)
});

