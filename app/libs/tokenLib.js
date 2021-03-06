const jwt=require('jsonwebtoken');
const shortid=require('shortid');
const secretkey="myScretKeyYoyo";

let generateToken=(data,cb)=>{
    try{
   let claims={
     jwtid:shortid.generate(),
     iat:Date.now(),
     exp:Math.floor(Date.now()/1000)+60*60*24,
     sub:'authToken',
     iss:'meetApp',
     data:data
   }
   let tokenDetails={
       token:jwt.sign(claims,secretkey),
       secretkey:secretkey
   }
   cb(null,tokenDetails);
    }
    catch(err){
    console.log(err);
    cb(err,null);
    }
}

let verifyClaim=(token,cb)=>{
    jwt.verify(token,secretkey,function(err,decoded){
        if(err){
            console.log('error while verify token');
            console.log(err);
            cb(err,null)
        }
        else{
            console.log('token verified');
            console.log(decoded);
            cb(null,decoded);
        }
    })
}
let verifyClaimWithoutSecret = (token,cb) => {
    // verify a token symmetric
    jwt.verify(token, secretkey, function (err, decoded) {
      if(err){
        console.log("error while verify token");
        console.log(err);
        cb(err,decoded)
      }
      else{
        console.log("user verified");
        cb (null,decoded)
      }  
   
   
    });
  
  
  }// end verify claim 
  
  
module.exports={
    generateToken:generateToken,
    verifyToken:verifyClaim,
    verifyClaimWithoutSecret:verifyClaimWithoutSecret
}