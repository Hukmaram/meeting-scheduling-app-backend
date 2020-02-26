const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const request = require("request")
const Auth = mongoose.model('Auth')

const logger = require('./../libs/loggerLib')
const responseLib = require('./../libs/responseLib')
const token = require('./../libs/tokenLib')
const check = require('./../libs/checkLib')
let isAuthorized=(req,res,next)=>{
    if(req.params.authToken || req.query.authToken || req.body.authToken || req.header('authToken')){
     Auth.findOne({authToken:req.params.authToken || req.query.authToken || req.body.authToken || req.header('authToken')},(err,authDetails)=>{
      if(err){
          console.log(err);
          logger.error("Autherization internal error","isAtherized MiddleWare",10);
          let apiResponse=responseLib.generate(true,"Autherization internal error",500,null);
          res.send(apiResponse);
      }
      else if(check.isEmpty(authDetails)){
       logger.error("Autherization key is not there","isAutherized Middleware",10);
       let apiResponse=responseLib.generate(true,"Invalid Autherization key",404,null);
       res.send(apiResponse)
      }
      else{
         token.verifyToken(authDetails.authToken,(err,decoded)=>{
             if(err){
                logger.error('AuthToken is not verified',"isAutherized Middleware",10);
                let apiResponse=responseLib.generate(true,"Autherization failed",500,null)
                res.send(apiResponse);
             }
             else{
                 req.user={userId:decoded.data.userId}
             }
         })
      }
     })
    }
}
module.exports = {
    isAuthorized: isAuthorized
  }