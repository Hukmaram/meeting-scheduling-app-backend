const express = require('express');
const router = express.Router();
const meetingController = require("./../../app/controllers/meetingController");
const appConfig = require("./../../config/appConfig")
const auth = require('./../middlewares/auth')
module.exports.setRouter = (app) => {

    let baseUrl = `${appConfig.apiVersion}/meetings`;

    // params: meetingTopic,hostId,hostName,participantId,participantName,participantEmail,meetingStartDate,meetingEndDate,meetingDescription,meetingPlace


    app.post(`${baseUrl}/addMeeting`, meetingController.addMeetingFunction);
    
    app.get(`${baseUrl}/view/all/meetings/:userId`, meetingController.getAllMeetings);
    app.post(`${baseUrl}/:meetingId/delete`, meetingController.deleteMeetingFunction);
    app.get(`${baseUrl}/:meetingId/details`, meetingController.getMeetingDetailsFunction);
    app.put(`${baseUrl}/:meetingId/updateMeeting`, meetingController.updateMeetingFunction);
    app.post(`${baseUrl}/admin-meetings/sentReminders`, meetingController.sendReminderForTodaysMeetings);
}