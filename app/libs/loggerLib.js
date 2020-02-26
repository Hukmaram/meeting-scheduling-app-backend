'use strict'
const logger = require('pino')()
const moment = require('moment')
let captureError=(errorMessage,errorOrigin,errorLevel)=>{
    let currenttime=moment();
    let errorResponse={
        timestamp:currenttime,
        errorMessage:errorMessage,
        errorOrigin:errorOrigin,
        errorLevel:errorLevel
    }
    logger.error(errorResponse)
    return errorResponse;
}

let captureInfo=(message,origin,importance)=>{
    let currenttime=moment()
    let infoMessage={
        timestamp:currenttime,
        message:message,
        origin:origin,
        level:importance
    }
    logger.error(infoMessage)
    return infoMessage;
}

module.exports={
    error:captureError,
    info:captureInfo
}

