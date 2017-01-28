import './body.html';
import '../../components/nav/nav.html';
Template.body.helpers({
    markers() {
        return Markers.find({});
    }
});
