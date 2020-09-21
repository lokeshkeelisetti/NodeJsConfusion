const express = require('express');
const bodyParser =require('body-parser');
const mongoose =require('mongoose');
const authenticate = require('../authenticate');
const cors = require('./cors');

const Favorites = require('../models/favorite');

const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
.options(cors.corsWithOptions,(req,res) => { res.sendStatus(200);})
.get(cors.cors,authenticate.verifyUser,(req,res,next)=> {
    Favorites.find({user:req.user._id})
    .populate('user')
    .populate('dishes')
    .then((favorite) => {
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(favorite);
    },(err) => next(err))
    .catch((err) => next(err));
})
.post(cors.cors,authenticate.verifyUser,(req,res,next)=>{
    Favorites.find({user:req.user._id})
    .populate('user')
    .populate('dishes')
    .then((favorite) => {
        if(favorite.length!=0){
            for(var i=0;i<req.body.length;i++){
                if(favorite[0].dishes.indexOf(req.body[i]._id)===-1){
                    favorite[0].dishes.push(req.body[i]._id);
                }
            }
            res.statusCode = 200;
            res.setHeader('Content-Type','application/json');
            res.json(favorite[0]);
        }
        else{
            var favorite = {
                user: req.user._id,
                dishes:[]
            }
            for(var i=0;i<req.body.length;i++){
                favorite.dishes.push(req.body[i]._id);
            }
            Favorites.create(favorite)
            .then((favorite)=> {
                res.statusCode = 200;
                res.setHeader('Content-Type','application/json');
                res.json(favorite);    
            },(err)=>next(err));
        }
    },(err)=>next(err))
    .catch((err)=>next(err));
})
.delete(cors.cors,authenticate.verifyUser,(req,res,next)=>{
    Favorites.remove({user:req.user._id})
    .then((favorite) => {
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(favorite);
    },(err)=>next(err))
    .catch((err)=>next(err));
})

favoriteRouter.route('/:dishId')
.options(cors.corsWithOptions,(req,res) => { res.sendStatus(200);})
.post(cors.cors,authenticate.verifyUser,(req,res,next)=>{
    Favorites.find({user:req.user._id})
    .populate('user')
    .populate('dishes')
    .then((favorite) => {
        if(favorite.length!=0){
            if(favorite[0].dishes.indexOf(req.params.dishId)===-1){
                favorite[0].dishes.push(req.params.dishId);
            }
            res.statusCode = 200;
            res.setHeader('Content-Type','application/json');
            res.json(favorite[0]);
        }
        else{
            var favorit = {
                user: req.user._id,
                dishes:[]
            }
            favorit.dishes.push(req.params.dishId);
            Favorites.create(favorit)
            .then((favorit)=>{
                res.statusCode = 200;
                res.setHeader('Content-Type','application/json');
                res.json(favorit);    
            },(err)=>next(err));
        }
    },(err)=>next(err))
    .catch((err)=>next(err));
})
.delete(cors.cors,authenticate.verifyUser,(req,res,next)=>{
    Favorites.find({user:req.user._id})
    .populate('user')
    .populate('dishes')
    .then((favorite)=>{
        if(favorite[0].dishes.indexOf(req.params.dishId)!==-1){
            favorite[0].dishes.splice(favorite[0].dishes.indexOf(req.params.dishId),1);
        }
        res.setHeader('Content-Type','application/json');
        res.json(favorite[0]);
    },(err)=>next(err))
    .catch((err)=>next(err));
})

module.exports = favoriteRouter;