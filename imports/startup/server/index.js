// Import server startup through a single index entry point

import './fixtures.js';
import './register-api.js';
import { Markers } from '../../api/marker.js';
import { AccountsCommon } from 'meteor/accounts-base';
import { Meteor } from 'meteor/meteor';

travel_streams = {};

Meteor.methods({
    insertStartMarker: function(latlng) {
        Markers.insert({latlng: latlng, userId:this.userId});
    },
    changeMarkerToBus: function(id, latlng) {
        Markers.update(id, {$set: {"type": 'bus'}});
    }
});

Markers.allow({
    'insert': function (userId,doc) {
        return true;
    },
    'remove': function(userId, doc) {
        return userId == doc.userId;
    },
    'update': function(userId, doc) {
        return true;
    },
});

Meteor.publish('markers', function markersPublication() {
    return Markers.find();
});

// Listen to incoming HTTP requests, can only be used on the server
WebApp.connectHandlers.use(function(req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    return next();
});
