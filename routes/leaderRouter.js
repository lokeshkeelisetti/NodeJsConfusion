const express = require('express');
const bodyParser =require('body-parser');

const leaderRouter = express.Router();

leaderRouter.use(bodyParser.json());

leaderRouter.route('/')
.all((req,res,next) => {
    res.statusCode=200;
    res.setHeader('Content-Type','text/plain');
    next();
})
.get((req,res,next)=> {
    res.end('Will send all leaders details to you!');

})
.post((req,res,next) => {
    res.end('Will add the leader: '+req.body.name+
    ' with details: '+req.body.description);
})
.put((req,res,next) => {
    res.statusCode =403;
    res.end('PUT operation not supported on /leaders');
})
.delete((req,res,next)=> {
    res.end('Deleting all the leaders!');
});

leaderRouter.route('/:leaderId')
.all((req,res,next) => {
    res.statusCode=200;
    res.setHeader('Content-Type','text/plain');
    next();
})
.get((req,res,next)=>{
    res.end('Will send the details of leader: '+req.params.leaderId);
})
.post((req,res,next)=>{
    res.statusCode=403;
    res.end('POST operation not supported on /leaders/'+req.params.leaderId);
})
.put((req,res,next)=>{
    res.end('Will update th dish: '+req.params.leaderId);
})
.delete((req,res,next)=> {
    res.end('Deleting the dish '+req.params.leaderId);
})

module.exports =leaderRouter;