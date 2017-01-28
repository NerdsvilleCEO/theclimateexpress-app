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
            return Meteor.user().profile.name;
        }
    });
}
