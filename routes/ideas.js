const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { ensureAuthenticated } = require('../helpers/auth');

// Load Models
require("../models/Idea");
const Idea = mongoose.model('ideas');

// Idea Index Page
router.get('/', ensureAuthenticated, (req, res) => {
    Idea.find({ user: req.user.id })
        .sort({ date: 'desc' })
        .then(ideas => {
            res.render('./ideas/index', {
                ideas: ideas
            });
        });

});

// Add Idea Form
router.get('/add', ensureAuthenticated, (req, res) => {
    res.render('ideas/add');
});

// Edit Idea Form
router.get('/edit/:id', ensureAuthenticated, (req, res) => {
    Idea.findOne({
        _id: req.params.id
    })
        .then(idea => {
            if (idea.user != req.user.id) {
                req.flash('error_msg', 'Not Authorized');
                res.redirect('/ideas');
            } else {
                res.render('ideas/edit', {
                    idea: idea
                });
            }

        })

});

// Process Form
// Made empty array to hold errors
// That made if statements to say if there is no title or details to 
// push error message to the array. 
router.post('/', ensureAuthenticated, (req, res) => {
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
            details: req.body.details,
            user: req.user.id
        }
        new Idea(newUser)
            .save()
            .then(idea => {
                req.flash('success_msg', "Video Idea Added");
                res.redirect('/ideas');
            });
    }
});

// Edit Form Process
router.put('/:id', ensureAuthenticated, (req, res) => {
    // Takes model, uses method findOne to match params.id to the id from the DB
    // Then will allow us to edit the values and save them to that item
    // FInally will redirect us back to the ideas page
    Idea.findOne({
        _id: req.params.id
    })
        .then(idea => {
            // New Values to be saved
            idea.title = req.body.title;
            idea.details = req.body.details;

            idea.save()
                .then(idea => {
                    req.flash('success_msg', "Video Idea Updated");
                    res.redirect('/ideas')
                })
        });
});

// Delete Idea
router.delete('/:id', ensureAuthenticated, (req, res) => {
    Idea.deleteOne({
        // Deleting idea that matches the id from params
        _id: req.params.id
    })
        .then(() => {
            // After redirect user back to ideas page
            req.flash('success_msg', "Video Idea Removed");
            res.redirect('/ideas')
        });
});


module.exports = router;