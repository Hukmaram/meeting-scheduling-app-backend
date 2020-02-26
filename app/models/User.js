const mongoose=require('mongoose');
const Schema=mongoose.Schema;
const userSchema=new Schema({
    userId:{
        type:String,
        default:"",
        index:true,
        unique:true
    },
    firstName:{
        type:String,
        default:''
    },
    lastName:{
        type:String,
        default:''
    },
    email:{
        type:String,
        default:''
    },
    password:{
        type:String,
        default:''
    },
    admin:{
      type:String,
      default:'false'
    },
    country:{
      type:String,
      default:''
    },
    mobile:{
        type:Number,
        default:0
    },
    validationToken: { //will generate automatically while resetting password
        type: String,
        default: ''
      },
    createdOn:{
        type:Date,
        default:""
    }
});

mongoose.model('User',userSchema);