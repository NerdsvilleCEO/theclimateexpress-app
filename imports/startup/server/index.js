// Import server startup through a single index entry point

import './fixtures.js';
import './register-api.js';

travel_streams = {};

Meteor.publish("markers", function () {
    return Markers.find();
});

// Listen to incoming HTTP requests, can only be used on the server
WebApp.connectHandlers.use(function(req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    return next();
});
