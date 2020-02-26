const nodemailer=require('nodemailer');
let sendEmail=(sendEmailOptions)=>{
let account={
    user:'rumpumbc29@gmail.com',
    pass:'hukmaram123'
}

let transporter=nodemailer.createTransport({
    service:'Gmail',
    auth:{
        user:account.user,
        pass:account.pass
    }
});

let mailOptions={
    from:'rumpumbc29@gmail.com',
    to:sendEmailOptions.email,
    subject:sendEmailOptions.subject,
    html:sendEmailOptions.html
}
transporter.sendMail(mailOptions,(error,info)=>{
    if(error){
        console.log(error);
    }
    else{
        console.log('Email sent successfully',info);
    }
})
}
module.exports={
    sendEmail:sendEmail
}