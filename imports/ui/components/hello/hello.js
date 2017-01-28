import './hello.html';
import {Markers} from '../../../api/marker.js';
import { Meteor } from 'meteor/meteor';

// create marker collection
Meteor.subscribe('markers');
Template.map.rendered = function() {
  var busIcon = L.icon({
      iconUrl: '/img/bus.png',

      iconSize:     [20, 20], // size of the icon
  });

  L.Icon.Default.imagePath = 'packages/bevanhunt_leaflet/images/';
  function onLocationFound(e) {
      var radius = e.accuracy / 2;

      L.marker(e.latlng).addTo(map)
          .bindPopup("You are within " + radius + " meters from this point").openPopup();

      L.circle(e.latlng, radius).addTo(map);
  }

  var map = L.map('map', {
    doubleClickZoom: false
  }).fitWorld();
  L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);
  map.locate({setView: true, maxZoom: 13});
  map.on('locationfound', onLocationFound);
  map.on('click', function(event) {
      //Markers.insert({latlng: event.latlng});
      Meteor.call('insertStartMarker', event.latlng);
  });

  var query = Markers.find();
  query.observe({
    changed: function(document, old){
        var payload = {};
        var old_marker = new L.marker(old.latlng);
        map.eachLayer(function (layer) {
            if(layer._latlng && layer._latlng.lat == old.latlng.lat && layer._latlng.lng == old.latlng.lng) {
                map.removeLayer(layer);
            }
        });
        if(document.type && document.type == "bus") {
            payload = {icon: busIcon};
        }
        var marker = L.marker(document.latlng, payload).addTo(map);
    },
    added: function (document) {
        var payload = {};
        if(document.type && document.type == "bus") {
            payload = {icon: busIcon};
        }
        var marker = L.marker(document.latlng, payload).addTo(map)
        .on('click', function(event) {
          //Switch to a flag for end point, if staff
          type = "flag";
          //Switch to a view for showing the purchased miles, if user and not started
          //Switch to a view showing the bus location on path if started
          //If bus driver, updated marker type to bus, this will be updated along the way
          Meteor.call('changeMarkerToBus', document._id);
          marker.on('click', function(event){
              //If they click again, remove it
              map.removeLayer(marker);
              Markers.remove({_id: document._id});
          });
        });
    },
    removed: function (oldDocument) {
      layers = map._layers;
      var key, val;
      for (key in layers) {
        val = layers[key];
        if (val._latlng) {
          if (val._latlng.lat === oldDocument.latlng.lat && val._latlng.lng === oldDocument.latlng.lng) {
            map.removeLayer(val);
          }
        }
      }
    }
  });
}
