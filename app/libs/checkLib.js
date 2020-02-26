let trim=(x)=>{
    let value=String(x);
    return value.replace(/^\s+|\s+$/gm,'');
}
let trimmer=(x)=>{
    let value=String(x);
    return value.replace(/[^\w\s]/gi, '');
}
let isEmpty=(value)=>{
    if(value===null || value==="undefined" || trim(value)==='' || value.length===0){
      return true;
    }
    else{
        return false;
    }
}

module.exports={
    isEmpty:isEmpty,
    trimmer:trimmer
}