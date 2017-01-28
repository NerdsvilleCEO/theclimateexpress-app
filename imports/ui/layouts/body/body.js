import './body.html';

Template.body.helpers({
    markers() {
        return Markers.find({});
    }
});
