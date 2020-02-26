const mongoose = require('mongoose');
const shortid = require('shortid');
const passwordLib = require('./../libs/passwordLib');
const response = require('./../libs/responseLib')
const logger = require('./../libs/loggerLib');
const check = require('../libs/checkLib');
const token = require('../libs/tokenLib');
const emailLib=require('./../libs/emailLib');
const AuthModel = mongoose.model('Auth');
const UserModel = mongoose.model('User');
const applicationUrl='http://localhost:4200'
/* Get all user Details */
let getAllUser = (req, res) => {
    UserModel.find()
        .select(' -__v -_id')
        .lean()
        .exec((err, result) => {
            if (err) {
                console.log(err)
                logger.error(err.message, 'User Controller: getAllUser', 10)
                let apiResponse = response.generate(true, 'Failed To Find User Details', 500, null)
                res.send(apiResponse)
            } else if (check.isEmpty(result)) {
                logger.info('No User Found', 'User Controller: getAllUser')
                let apiResponse = response.generate(true, 'No User Found', 404, null)
                res.send(apiResponse)
            } else {
                let apiResponse = response.generate(false, 'All User Details Found', 200, result)
                res.send(apiResponse)
            }
        })
}// end get all users
let getSingleUser = (req, res) => {
    UserModel.findOne({ 'userId': req.params.userId })
        .select('-password -__v -_id')
        .lean()
        .exec((err, result) => {
            if (err) {
                console.log(err)
                logger.error(err.message, 'User Controller: getSingleUser', 10)
                let apiResponse = response.generate(true, 'Failed To Find User Details', 500, null)
                res.send(apiResponse)
            } else if (check.isEmpty(result)) {
                logger.info('No User Found', 'User Controller:getSingleUser')
                let apiResponse = response.generate(true, 'No User Found', 404, null)
                res.send(apiResponse)
            } else {
                let apiResponse = response.generate(false, 'User Details Found', 200, result)
                res.send(apiResponse)
            }
        })
}// end get single user
//user sign up
let signupFunction=(req,res)=>{
    let validateUserInput=()=>{
       return new Promise((resolve,reject)=>{
        if(check.isEmpty(req.body.email)){
            console.log("Email field cannot blank");
            let apiResponse=response.generate(true,"Email field cannot be blank");
            reject(apiResponse);
        }
        else if(check.isEmpty(req.body.password)){
            console.log("Password field cannot blank");
            let apiResponse=response.generate(true,"Password field cannot be blank");
            reject(apiResponse); 
        }
        else{
           resolve(req);
        }
       })
        }

        let createUser=()=>{
            return new Promise((resolve,reject)=>{
                UserModel.findOne({email:req.body.email}).exec((err,retrievedObject)=>{
                    if(err){
                        logger.error(err.message,"userControll:origin at createUser",10);
                        let apiResponse=response.generate(true,"Failed to create user",500,null);
                        reject(apiResponse);
                    }
                    else if(check.isEmpty(retrievedObject)){
                      let newUser=new UserModel(
                          {
                            userId:shortid.generate(),
                            firstName:req.body.firstName,
                            lastName:req.body.lastName,
                            email:req.body.email.toLowerCase(),
                            password:passwordLib.hashpassword(req.body.password),
                            admin:req.body.admin,
                            mobile:check.trimmer(req.body.mobile),
                            country:req.body.country,
                            createdOn:Date.now()
                         } )
                         logger.error(passwordLib.hashpassword(req.body.password),"password",10)
                            newUser.save((err,newUser)=>{
                                if(err){
                                    logger.error(err.message,"userControll:Origin at craeteUser Saving",10);
                                    let apiResponse=response.generate(true,"Failed to craete user",500,null);
                                    reject(apiResponse);           
                                }
                                else{
                                    let newUserObj=newUser.toObject();
                                    resolve(newUserObj);
                                }
                            })
                    }
                    else{
                        logger.error("User already exist","userControll:origin at createUser",10);
                        let apiResponse=response.generate(true,"User already exist",403,null)
                        reject(apiResponse);
                    }
                })
            })
        }

        validateUserInput(req,res)
        .then(createUser)
        .then((resolve)=>{
          delete resolve.password;
          let apiResponse=response.generate(false,"Account created Successfully",200,resolve);
          res.send(apiResponse);
        })
        .catch((err)=>{
            console.log(err);
            res.send(err);
        })
    }

    let loginFunction=(req,res)=>{
        console.log("find user");
     let findUser=()=>{
         return new Promise((resolve,reject)=>{
            UserModel.findOne({email:req.body.email},(err,userDetails)=>{
                if(err){
                    logger.error("failed to find user details","userControlller:findUser",10);
                    let apiResponse=response.generate(true,"failed to find user details",500,null);
                    reject(apiResponse)
                }
                else if(check.isEmpty(userDetails)){
                   logger.error("User not found","userController:findUser",10)
                   let apiResponse=response.generate(true,"User not found",404,null);
                   reject(apiResponse);
                }
                else{
                    resolve(userDetails);
                }
            })
         })
     }
     let validatePassword=(retrievedUserDetails)=>{
         console.log("Validate password");
         return new Promise((resolve,reject)=>{
           passwordLib.comparePassword(req.body.password,retrievedUserDetails.password,(err,isMatch)=>{
               if(err){
                   logger.error(err.message,"userController:validatePassword",5);
                   let apiResponse=response.generate(true,"Login Failed",500,null);
                   reject(apiResponse);
               }
               else if(isMatch){
                   let retrievedUserDetailsObj=retrievedUserDetails.toObject();
                   delete retrievedUserDetailsObj.password;
                   delete retrievedUserDetailsObj._id;
                   delete retrievedUserDetailsObj.__v;
                   delete retrievedUserDetailsObj.createdOn;
                   resolve(retrievedUserDetailsObj);
               }
               else{
                   logger.info('Login Failed Due To Invalid Password', 'userController: validatePassword()', 10);
                   let apiResponse=response.generate(true,"Wrong password",400,null);
                   reject(apiResponse);
               }
           })
         })
     }


     let generateToken=(userDetails)=>{
         return new Promise((resolve,reject)=>{
             token.generateToken(userDetails,(err,tokenDetails)=>{
                 if(err){
                     logger.error("error occured during token generation","userController:generateToken",10);
                     let apiResponse=response.generate("error occured during token generation",500,null);
                     reject(apiResponse);
                 }
                 else if(check.isEmpty(tokenDetails)){
                     logger.error("empty token","userController:generate token",10);
                     let apiResponse=response.generate(true,"empty token",404,null);
                     reject(apiResponse);
                 }
                 else{
                     tokenDetails.userId=userDetails.userId;
                     tokenDetails.userDetails=userDetails;
                     resolve(tokenDetails);
                 }
             })
         })
        }
        let saveToken=(tokenDetails)=>{
            return new Promise((resolve,reject)=>{
                AuthModel.findOne({userId:tokenDetails.userId},(err,retrivedTokenDetails)=>{
                    if(err){
                        logger.error("failed to generate token","userController:saveToken",10);
                        let apiResponse=response.generate(true,"failed to generate token",500,null);
                        reject(apiResponse);
                    }
                    else if(check.isEmpty(retrivedTokenDetails)){
                        let newAuthToken=new AuthModel({
                            userId:tokenDetails.userId,
                            authToken:tokenDetails.token,
                            tokenScret:tokenDetails.tokenScret,
                            tokenGenerationTime:Date.now()
                        })
                        newAuthToken.save((err,newTokenDetails)=>{
                            if(err){
                                logger.error("failed to save token","userController:saveToken",10);
                                let apiResponse=response.generate(true,"Failed to save token",404,null);
                                reject(apiResponse);
                            }
                            else{
                                let responseBody={
                                    authToken:newTokenDetails.authToken,
                                    userDetails:tokenDetails.userDetails
                                }
                                resolve(responseBody)
                            }
                        })
                    }
                    else{
                        retrivedTokenDetails.authToken=tokenDetails.token;
                        retrivedTokenDetails.tokenScret=tokenDetails.tokenScret;
                        retrivedTokenDetails.tokenGenerationTime=Date.now();
                        retrivedTokenDetails.save((err,newTokenDetails)=>{
                            if(err){
                                logger.error("failed to save token","userController:saveToken",10);
                                let apiResponse=response.generate(true,"Failed to save token",404,null);
                                reject(apiResponse);
                            }
                            else{
                                let responseBody={
                                    authToken:newTokenDetails.authToken,
                                    userDetails:tokenDetails.userDetails
                                }
                                resolve(responseBody)
                            } 
                        })
                    }
                })
            })
        }
        findUser(req,res)
        .then(validatePassword)
        .then(generateToken)
        .then(saveToken)
        .then((resolve)=>{
           let apiResponse=response.generate(false,"Login Successfully",200,resolve);
           res.status(200);
           res.send(apiResponse);
        })
        .catch((err)=>{
            console.log("ErrorHandler");
            console.log(err);
            console.log(err.status);
            res.status(err.status);
            res.send(err)
        })

    }

    let forgotPasswordFunction=(req,res)=>{
        findUser=()=>{
         return new Promise((resolve,reject)=>{
             UserModel.findOne({email:req.body.email},(err,userDetails)=>{
                 if(err){
                     logger.error('Failed To Retrieve User Data',"userController:findUser()",10);
                     let apiResponse=response.generate(true,"Email not found",500,null);
                     reject(apiResponse)
                 }
                 else if(check.isEmpty(userDetails)){
                    logger.error('user not found',"userController:findUser()",10);
                    let apiResponse=response.generate(true,"user not found",404,null);
                    reject(apiResponse)
                 }
                 else{
                     logger.info("user found","userController:findUser()",5)
                     resolve(userDetails);
                 }

             })
         })
        }
       let generateToken=(userDetails)=>{
          return new Promise((resolve,reject)=>{
              token.generateToken(userDetails,(err,tokenDetails)=>{
                  if(err){
                      logger.error("Failed to generate token","userControllee:generateToken()",10);
                      let apiResponse=response.generate(true,"Failed to generate token",500,null);
                      reject(apiResponse);
                  }
                  else{
                     tokenDetails.userId=userDetails.userId;
                     tokenDetails.userDetails=userDetails;
                     resolve(tokenDetails);
                  }
              })
          })
       }
       let resetPassword=(tokenDetails)=>{
           return new Promise((resolve,reject)=>{
               let options={
                   validationToken:tokenDetails.token
               }
               UserModel.update({'email':req.body.email},options).exec((err,result)=>{
                   if(err){
                       logger.error("failed to reset password","userController:resetPassword()",10);
                       let apiResponse=response.generate(true,"failed to reset password",500,null);
                       reject(apiResponse);
                   }
                   else{
                       
                       resolve(result);
                      let sendEmailOptions={
                          email:tokenDetails.userDetails.email,
                          subject:'Reset Password for Meeting Scheduling App',
                          html:`<h5>Hi ${tokenDetails.userDetails.firstName}</h5>
                                  <p> 
                                  We got a request to reset your password associated with this ${tokenDetails.userDetails.email} .<br>
                                  <br>Please use following link to reset your password. <br>
                                <br> <a href="${applicationUrl}/reset-password/${options.validationToken}">Click Here</a> 
                                  </p>
                                  <br><b>Thanks & Regards</b>
                                  <br><b>MeetApp</b>
                                  `
                      } 
                      setTimeout(()=>{
                          emailLib.sendEmail(sendEmailOptions);
                      },2000)
                   }
               })


           })
       }
       findUser(req,res)
       .then(generateToken)
       .then(resetPassword)
       .then((resolve)=>{
           let apiResponse=response.generate(false,"Password reset instruction sent successfully",200,resolve);
           res.send(apiResponse)
       })
       .catch((err)=>{   
           res.send(err);
           res.status(err.status);
       })
    }

    let updatePasswordFunction=(req,res)=>{
        let findUser=()=>{
            return new Promise((resolve,reject)=>{
                if(req.body.validationToken){
                UserModel.findOne({validationToken:req.body.validationToken},(err,userDetails)=>{
                    if(err){
                     logger.error("Failed to retrieve user","userController:findUser()",10);
                     let apiResponse=response.generate(true,"Failed to retrieve user",400,null);
                     reject(apiResponse);
                    }
                    else if(check.isEmpty(userDetails)){
                        logger.error("No user found","userController:findUser()",10);
                        let apiResponse=response.generate(true,"No user found",400,null);
                        reject(apiResponse);
                    }
                    else{
                        logger.info("user found","userController:findUser()",5);
                        resolve(userDetails);
                    }
                })
            }
            else{
                logger.error("Validation Token is missing","userController:findUser()",10);
                let apiResponse=response.generate(true,"Token is missing",404,null);
                reject(apiResponse)
            }
            })
           }
         let passwordUpadte=(userDetails)=>{
             return new Promise((resolve,reject)=>{
                 let options={
                     password:passwordLib.hashpassword(req.body.password),
                     validationToken:'Null'
                 }
                 UserModel.update({'userId':userDetails.userId},options)
                 .exec((err,result)=>{
                     if(err){
                         logger.error("password not updated","userController:passwordUpdate()",10);
                         let apiResponse=response.generate(true,"password not updated",400,null);
                         reject(apiResponse);
                     }
                     else if(check.isEmpty(result)){
                      logger.error("No user found with given details","userController:passwordUpdate()",10);
                      let apiResponse=response.generate(true,"No user found with given details",404,null);
                      reject(apiResponse);
                     }
                     else{
                         
                         resolve(result)
                     }
                 })
             })
         }

         findUser(req,res)
         .then(passwordUpadte)
         .then((resolve)=>{
            logger.info("password updated successfully","updatepassword",10)
             let apiResponse=response.generate(false,"password updated successfully",200,"none");
             res.status(200)
             res.send(apiResponse)
         })
         .catch((err)=>{
             res.status(err.status);
             res.send(err);
         })

    }

   /**
 * function to logout user.
 * auth params: userId.
 */
let logout = (req, res) => {
    AuthModel.findOneAndRemove({ userId: req.params.userId }, (err, result) => {
        if (err) {
            console.log(err)
            logger.error(err.message, 'user Controller: logout', 10)
            let apiResponse = response.generate(true, `error occurred: ${err.message}`, 500, null)
            res.send(apiResponse)
        } else if (check.isEmpty(result)) {
            let apiResponse = response.generate(true, 'Already Logged Out or Invalid UserId', 404, null)
            res.send(apiResponse)
        } else {
            let apiResponse = response.generate(false, 'Logged Out Successfully', 200, null)
            res.send(apiResponse)
        }
    })
} // end of the logout function.

    module.exports={
        getAllUser:getAllUser,
        getSingleUser:getSingleUser,
        signupFunction:signupFunction,
        loginFunction:loginFunction,
        forgotPasswordFunction:forgotPasswordFunction,
        updatePasswordFunction:updatePasswordFunction,
        logout:logout
    }
