const express = require('express');
const router = express.Router();
const appConfig=require('./../../config/appConfig');
const userController = require("./../../app/controllers/userController");
const auth = require('./../middlewares/auth');
module.exports.setRouter=(app)=>{
    let baseUrl = `${appConfig.apiVersion}/users`;
    
    app.post(`${baseUrl}/signup`,userController.signupFunction);
    app.post(`${baseUrl}/login`,userController.loginFunction);
    app.post(`${baseUrl}/forgotPassword`,userController.forgotPasswordFunction);
    app.post(`${baseUrl}/resetpassword`,userController.updatePasswordFunction);
    app.get(`${baseUrl}/view/all`, userController.getAllUser);
    app.get(`${baseUrl}/view/:userId`, userController.getSingleUser);
    app.post(`${baseUrl}/:userId/logout`, userController.logout);
    
}