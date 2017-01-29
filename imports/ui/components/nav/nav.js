import './nav.html';
import { Meteor } from 'meteor/meteor';

if(Meteor.isClient) {
    Template.nav.events({
        'click .logout': function(event){
            event.preventDefault();
            console.log('test');
            Meteor.logout();
        }
    });
    Template.nav.helpers({
        email: function(){
            return Meteor.user().emails[0].address;
        },
        name: function(){
            var profile = Meteor.user().profile;
            return profile.first + " " + profile.last;
        },
        role: function(){
            return Meteor.user().profile.role;
        }
    });
}
