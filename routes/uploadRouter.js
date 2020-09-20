const bodyParser =require('body-parser');
const authenticate = require('../authenticate');
const express = require('express');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req,file,cb) => {
        cb(null,'public/images')
    },
    filename: (req,file,cb) => {
        cb(null,file.originalname);
    }
});

const imageFileFilter = (req,file,cb) => {
    if(!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)){
        return cb(new Error('You can upload image files only!')
        ,false);
    }
    cb(null,true);
};

const upload = multer({storage:storage,fielFilter:
    imageFileFilter});

const uploadRouter = express.Router();

uploadRouter.use(bodyParser.json());

uploadRouter.route('/')
.get(authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next) => {
    res.statusCode =403;
    res.end('GET operation not supported on /dishes/'+req.params.dishId+' comments');
})
.post(authenticate.verifyUser,authenticate.verifyAdmin, upload.single('imageFile'),
(req,res)=> {
    res.statusCode=200;
    res.setHeader('Content-Type','applictaion/json');
    res.json(req.file);
})
.put(authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next) => {
    res.statusCode =403;
    res.end('PUT operation not supported on /dishes/'+req.params.dishId+' comments');
})
.delete(authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next) => {
    res.statusCode =403;
    res.end('DELETE operation not supported on /dishes/'+req.params.dishId+' comments');
})

module.exports = uploadRouter;