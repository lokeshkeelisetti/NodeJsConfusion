const express=require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate')

const Promotions = require('../models/promotions');

const promoRouter= express.Router();

promoRouter.use(bodyParser.json());

promoRouter.route('/')
.get((req,res,next)=> {
    Promotions.find({})
    .then((promotions) => {
        res.statusCode =200;
        res.setHeader('Content-Type','application/json');
        res.json(promotions);
    },(err) => next(err))
    .catch((err)=> next(err));
})
.post(authenticate.verifyUser,(req,res,next) => {
    if(authenticate.verifyAdmin(req.user)){
        Promotions.create(req.body)
        .then((promotion) => {
            console.log('Promotion Created ',);
            res.statusCode =200;
            res.setHeader('Content-Type','application/json');
            res.json(promotion);
        },(err)=> next(err))
        .catch((err)=> next(err));    
    }
    else{
        var err = new Error('You are not authenticated to perform this operation');
        err.status=403;
        next(err);
    }

})
.put(authenticate.verifyUser,(req,res,next) => {
    if(authenticate.verifyAdmin(req.user)){
        res.statusCode =403;
        res.end('PUT operation not supported on /promotions');    
    }
    else{
        var err = new Error('You are not authenticated to perform this operation');
        err.status =403;
        next(err);
    }
})
.delete(authenticate.verifyUser,(req,res,next)=> {
    if(authenticate.verifyAdmin(req.user)){
        Promotions.remove({})
        .then((resp)=> {
            res.statusCode =200;
            res.setHeader('Content-Type','application/json');
            res.json(resp);
        },(err) => next(err));    
    }
    else{
        var err = new Error('You are not authenticated to perform this operation');
        err.status = 403;
        next(err);
    }

});

promoRouter.route('/:promotionId')
.get((req,res,next)=>{
    Promotions.findById(req.params.promotionId)
    .then((promotion) => {
        res.statusCode =200;
        res.setHeader('Content-Type','application/json');
        res.json(promotion);
    },(err)=> next(err));

})
.post(authenticate.verifyUser,(req,res,next)=>{
    if(authenticate.verifyAdmin(req.user)){
        res.statusCode=403;
        res.end('POST operation not supported on /promotions/'+req.params.promotionId); 
    }
    else{
        var err = new Error('You are not authenticated to perform this operation');
        err.status = 403;
        next(err);
    }
       
})
.put(authenticate.verifyUser,(req,res,next)=>{
    if(authenticate.verifyAdmin(req.user)){
        Promotions.findByIdAndUpdate(req.params.promotionId,{
            $set: req.body
        },{new:true})
        .then((promotion) => {
            res.statusCode =200;
            res.setHeader('Content-Type','application/json');
            res.json(promotion);
        },(err)=> next(err))
        .catch((err)=>next(err));
    }    
    else{
        var err = new Error('You are not authenticated to perform this operation');
        err.status = 403;
        next(err);
    }
    
    
})
.delete(authenticate.verifyUser,(req,res,next)=> {
    if(authenticate.verifyAdmin(req.user)){
        Promotions.findByIdAndRemove(req.params.promotionId)
        .then((resp)=> {
            res.statusCode =200;
            res.setHeader('Content-Type','application/json');
            res.json(resp);
        },(err) => next(err))
        .catch((err)=> next(err));
    }
        else{
            var err = new Error('You are not authenticated to perform this operation');
            err.status = 403;
            next(err);
        }
    

});


module.exports =promoRouter;