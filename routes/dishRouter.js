const express = require('express');
const bodyParser =require('body-parser');
const mongoose =require('mongoose');
const authenticate = require('../authenticate');

const Dishes = require('../models/dishes');

const dishRouter = express.Router();

dishRouter.use(bodyParser.json());

dishRouter.route('/')
.get((req,res,next)=> {
    Dishes.find({})
    .populate('comments.author')
    .then((dishes) => {
        res.statusCode =200;
        res.setHeader('Content-Type','application/json');
        res.json(dishes);
    },(err) => next(err))
    .catch((err)=> next(err));
})
.post(authenticate.verifyUser,(req,res,next) => {
    if(authenticate.verifyAdmin(req.user)){
        Dishes.create(req.body)
        .then((dish) => {
            console.log('Dish Created ',dish);
            res.statusCode =200;
            res.setHeader('Content-Type','application/json');
            res.json(dish);
        },(err)=> next(err))
        .catch((err)=> next(err));       
    }
    else{
        var err = new Error('You are not authenticated to perform this operation');
        err.status =403;
        next(err);
    }
})
.put(authenticate.verifyUser,(req,res,next) => {
    if(authenticate.verifyAdmin(req.user)){
        res.statusCode =403;
        res.end('PUT operation not supported on /dishes');
    }    
    else{
        var err = new Error('You are not authenticated to perform this operation');
        err.status = 403;
        next(err);
    }
    
})
.delete(authenticate.verifyUser,(req,res,next)=> {
    if(authenticate.verifyAdmin(req.user)){
        Dishes.remove({})
        .then((resp)=> {
            res.statusCode =200;
            res.setHeader('Content-Type','application/json');
            res.json(resp);
        },(err) => next(err));
    }
    else{
        var err = new Error('You are not authenticated to perform this operation');
        err.status =403;
        next(err);
    }
        
});

dishRouter.route('/:dishId')
.get((req,res,next)=>{
    Dishes.findById(req.params.dishId)
    .populate('comments.author')
    .then((dish) => {
        res.statusCode =200;
        res.setHeader('Content-Type','application/json');
        res.json(dish);
    },(err)=> next(err));

})
.post(authenticate.verifyUser,(req,res,next)=>{
    if(authenticate.verifyAdmin(req.user)){
        res.statusCode=403;
        res.end('POST operation not supported on /dihes/'+req.params.dishId);  
    }
    else{
        var err = new Error('You are not authenticated to perform this operation');
        err.status =403;
        next(err);
    }
      
})
.put(authenticate.verifyUser,(req,res,next)=>{
    if(authenticate.verifyAdmin(req.user)){
        Dishes.findByIdAndUpdate(req.params.dishId,{
            $set: req.body
        },{new:true})
        .then((dish) => {
            res.statusCode =200;
            res.setHeader('Content-Type','application/json');
            res.json(dish);
        },(err)=> next(err))
        .catch((err)=>next(err));  
    }
    else{
        var err = new Error('You are not authenticated to perform this operation');
        err.status =403;
        next(err);
    }
      

})
.delete(authenticate.verifyUser,(req,res,next)=> {
    if(authenticate.verifyAdmin(req.user)){
        Dishes.findByIdAndRemove(req.params.dishId)
        .then((resp)=> {
            res.statusCode =200;
            res.setHeader('Content-Type','application/json');
            res.json(resp);
        },(err) => next(err))
        .catch((err)=> next(err));
    }
    else{
        var err = new Error('You are not authenticated to perform this operation');
        err.status =403;
        next(err);
    }
    
});

dishRouter.route('/:dishId/comments')
.get((req,res,next)=> {
    Dishes.findById(req.params.dishId)
    .populate('comments.author')
    .then((dish) => {
        if(dish!=null){
            res.statusCode =200;
            res.setHeader('Content-Type','application/json');
            res.json(dish.comments);    
        }
        else{
            err =new Error('Dish '+req.params.dishId+' not found');
            err.status =404;
            return next(err);
        }
    },(err) => next(err))
    .catch((err)=> next(err));
})
.post(authenticate.verifyUser,(req,res,next) => {
    Dishes.findById(req.params.dishId)
    .then((dish) => {
        if(dish!=null){
            req.body.author = req.user._id;
            dish.comments.push(req.body);
            dish.save()
            .then((dish) => {
                Dishes.findById(dish._id)
                .populate('comments.author')
                .then((dish)=> {
                    res.statusCode =200;
                    res.setHeader('Content-Type','application/json');
                    res.json(dish);    
                })
            },(err)=> next(err))
        }
        else{
            err =new Error('Dish '+req.params.dishId+' not found');
            err.status =404;
            return next(err);
        }
    },(err)=> next(err))
    .catch((err)=> next(err));
})
.put(authenticate.verifyUser,(req,res,next) => {
    res.statusCode =403;
    res.end('PUT operation not supported on /dishes/'+req.params.dishId+' comments');
})
.delete(authenticate.verifyUser,(req,res,next)=> {
    if(authenticate.verifyAdmin(req.user)){
        Dishes.findById(req.params.dishId)
        .then((dish) => {
            if(dish!=null){
                for(var i =(dish.comments.length-1);i>=0;i--){
                    dish.comments.id(dish.comments[i]._id).remove();
                }
                dish.save()
                .then((dish) => {
                    res.statusCode =200;
                    res.setHeader('Content-Type','application/json');
                    res.json(dish);
                },(err)=> next(err));
            }
            else{
                err =new Error('Dish '+req.params.dishId+' not found');
                err.status =404;
                return next(err);
            }
        },(err)=> next(err))
        .catch((err)=> next(err));    
    }
    else{
        var err = new Error('You are not authenticated to perform this operation');
        err.status =403;
        next(err);
    }

});

dishRouter.route('/:dishId/comments/:commentId')
.get((req,res,next)=>{
    Dishes.findById(req.params.dishId)
    .populate('comments.author')
    .then((dish) => {
        if(dish!=null&&dish.comments.id(req.params.commentId)!=null){
            res.statusCode =200;
            res.setHeader('Content-Type','application/json');
            res.json(dish.comments.id(req.params.commentId));    
        }
        else if(dish===null){
            err =new Error('Dish '+req.params.dishId+' not found');
            err.status =404;
            return next(err);
        }
        else{
            err =new Error('Comment '+req.params.commentId+' not found');
            err.status =404;
            return next(err); 
        }
    },(err)=> next(err));

})
.post(authenticate.verifyUser,(req,res,next)=>{
    res.statusCode=403;
    res.end('POST operation not supported on /dihes/'+req.params.dishId+
    '/comments/'+req.params.commentId);
})
.put(authenticate.verifyUser,(req,res,next)=>{
    Dishes.findById(req.params.dishId)
    .then((dish) => {
        if(dish!=null&&dish.comments.id(req.params.commentId)!=null&&(dish.comments.id(req.params.commentId).author.equals(req.user._id))){
            console.log(req.params.commentId,dish._id);
            if(req.body.rating){
                dish.comments.id(req.params.commentId).rating =req.body.rating;
            }
            if(req.body.comment){
                dish.comments.id(req.params.commentId).comment =req.body.comment;
            }
            dish.save()
            .then((dish) => {
                Dishes.findById(dish._id)
                .populate('comment.author')
                .then((dish) => {
                    res.statusCode =200;
                    res.setHeader('Content-Type','application/json');
                    res.json(dish);    
                })
            },(err)=> next(err))
        }
        else if(dish===null){
            err =new Error('Dish '+req.params.dishId+' not found');
            err.status =404;
            return next(err);
        }
        else if(!(dish.comments.id(req.params.commentId).author.equals(req.user._id))){
            console.log(dish.comments.id(req.params.commentId).author,(req.user._id));
            err = new Error('You are not authorized for this operation');
            err.status = 401;
            return next(err);
        }
        else{
            err =new Error('Comment '+req.params.commentId+' not found');
            err.status =404;
            return next(err); 
        }
    },(err)=> next(err))
    .catch((err)=>next(err));
})
.delete(authenticate.verifyUser,(req,res,next)=> {
    Dishes.findById(req.params.dishId)
    .then((dish) => {
        if(dish!=null&&dish.comments.id(req.params.commentId)!=null&&(dish.comments.id(req.params.commentId)._id != (req.user._id))){
            console.log(req.params.commentId,dish._id);
            dish.comments.id(req.params.commentId).remove();
            dish.save()
            .then((dish) => {
                Dishes.findById(dish._id)
                .populate('comment.author')
                .then((dish) => {
                    res.statusCode =200;
                    res.setHeader('Content-Type','application/json');
                    res.json(dish);    
                })
            },(err)=> next(err));
        }
        else if(dish===null){
            err =new Error('Dish '+req.params.dishId+' not found');
            err.status =404;
            return next(err);
        }
        else if(!(dish.comments.id(req.params.commentId).author.equals(req.user._id))){
            err = new Error('You are not authorized for this operation');
            err.status = 401;
            return next(err);
        }
        else{
            err =new Error('Comment '+req.params.commentId+' not found');
            err.status =404;
            return next(err); 
        }
    },(err)=> next(err))
    .catch((err)=> next(err));
});

module.exports =dishRouter;