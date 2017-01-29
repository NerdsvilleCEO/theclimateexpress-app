// Import server startup through a single index entry point

import './fixtures.js';
import './register-api.js';
import { Markers } from '../../api/marker.js';
import { AccountsCommon } from 'meteor/accounts-base';
import { Meteor } from 'meteor/meteor';

travel_streams = {};

Meteor.methods({
    insertStartMarker: function(latlng) {
        if(Markers.find({latlng: latlng}).fetch().length == 0) {
            Markers.insert({latlng: latlng, userId:this.userId, type: 'start'});
            return false;
        } else {
            return true;
        }
    },
    changeMarkerToBus: function(id) {
        Markers.update(id, {$set: {"type": 'bus'}});
    },
    insertFinishMarker: function(latlng, start) {
        if(Markers.find({start: start}).fetch().length == 0){
            Markers.insert({latlng: latlng, start: start, type: 'finish'});
        }
        results = Markers.find({start: start, type: "finish"}).fetch();
        if(results.length != 0){
            return results;
        }
        return false;
    },
    getFinishMarksForStart: function(latlng) {
        return Markers.find({start: latlng}).fetch();
    },
    changeMarkerToStart: function(id) {
        Markers.update(id, {$set: {"type": 'start'}});
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
