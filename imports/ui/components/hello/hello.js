import './hello.html';
import {Markers} from '../../../api/marker.js';
import { Meteor } from 'meteor/meteor';

// create marker collection
Meteor.subscribe('markers');
Template.map.rendered = function() {
  var busIcon = L.icon({
      iconUrl: '/img/bus-graphic.png',
      iconSize:     [60, 40] // size of the icon
  });

  var finalIcon = L.icon({
      iconUrl: '/img/destination-point.png',
      iconSize: [60, 40]
  });

  L.Icon.Default.imagePath = 'packages/bevanhunt_leaflet/images/';
  function onLocationFound(e) {
      var radius = e.accuracy / 2;

      L.marker(e.latlng).addTo(map)
          .bindPopup("You are within " + radius + " meters from this point").openPopup();

      L.circle(e.latlng, radius).addTo(map);
  }

  function getMarkerPayload(document){
      var payload = {};
      if(document.type && document.type == "bus") {
          payload = {icon: busIcon};
      } else if (document.type && document.type == "finish") {
          payload = {icon: finalIcon};
      }
      return payload;
  }

  function staffClick(event) {
      //If we are a staff member, we are going to
      // be able to click on a marker and insert a finish marker for that part
      //In addition to this, we are going to be able
      //  to click out of that by clicking anywhere outside of the finish marker
      //Finally, we should be able to remove the
      //  marker from the map, as well as database
      //Regardless of which method of exiting,
      //  we want to reflow with the base markers
      //  (except finish markers)
      if(Meteor.user().profile.role == 'staff'){
          Meteor.call('insertStartMarker', event.latlng);
      }
    }

    function staffCloseInsertEvent(newEvent, closeEvent){
        if(closeEvent.latlng != newEvent.latlng) {
            var redraw_query = Markers.find();
            var redraw_res_map = redraw_query.collection._docs._map;
            for(res in redraw_res_map) {
                if(redraw_res_map[res].type != "finish"){
                    var payload = getMarkerPayload(redraw_res_map[res]);
                    var redraw_marker = L.marker(redraw_res_map[res].latlng, payload);
                    redraw_marker.addTo(map);
                }
            }
        }
    }

    function staffInsertFinish(e, newEvent) {
        if(newEvent.latlng != e.latlng){
            Meteor.call('insertFinishMarker', newEvent.latlng, e.latlng, function(err, result){
                if(result){
                    Meteor.call('getFinishMarksForStart', result[0].start, function(err, results){
                        console.log(results[0]);
                        var payload = getMarkerPayload(results[0]);
                        var marker = L.marker(results[0].latlng, payload);
                        marker.addTo(map);
                    });
                }
            });
            map.off('click', staffInsertFinish);

            map.on('click', staffCloseInsertEvent.bind(null, newEvent));
        }
    }

  var map = L.map('map', {
    doubleClickZoom: false
  }).fitWorld();
  L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);
  map.locate({setView: true, maxZoom: 13});
  map.on('locationfound', onLocationFound);

  map.on('click', staffClick);

  var query = Markers.find();
  query.observe({
    changed: function(document, old){
        var old_marker = new L.marker(old.latlng);
        map.eachLayer(function (layer) {
            if(layer._latlng && layer._latlng.lat == old.latlng.lat && layer._latlng.lng == old.latlng.lng) {
                map.removeLayer(layer);
            }
        });
        var payload = getMarkerPayload(document);
        var marker = L.marker(document.latlng, payload).addTo(map);
    },
    added: function (document) {
        if(document.type != "finish"){
            var payload = getMarkerPayload(document);
            var marker = L.marker(document.latlng, payload);
            marker.addTo(map)
            .on('click', function(e) {
            //This is specific logic for user and driver since we only care when they click on a marker :)
            //Switch to a flag for end point, if staff
            //Switch to a view for showing the purchased miles, if user and not started
            if(Meteor.user().profile.role == "staff"){
                map.off('click', staffClick);
                map.eachLayer(function (layer) {
                    if(layer._latlng && (layer._latlng.lat != e.latlng.lat || layer._latlng.lng != e.latlng.lng)) {
                        map.removeLayer(layer);
                    }
                });
                Meteor.call('getFinishMarksForStart', e.latlng, function(err, results){
                        var payload = getMarkerPayload(results[0]);
                        var marker = L.marker(results[0].latlng, payload);
                        marker.addTo(map);
                });
                map.on('click', staffInsertFinish.bind(null, e));
            }

            if(Meteor.user().profile.role == "user") {
                map.eachLayer(function (layer) {
                    if(layer._latlng && (layer._latlng.lat != marker._latlng.lat || layer._latlng.lng != marker._latlng.lng)) {
                        map.removeLayer(layer);
                    }
                });
                marker.on('click', function(event){
                    var redraw_query = markers.find();
                    var redraw_res_map = redraw_query.collection._docs._map;
                    for(res in redraw_res_map) {
                        var payload = getmarkerpayload(redraw_res_map[res]);
                        var redraw_marker = l.marker(redraw_res_map[res].latlng, payload);
                        redraw_marker.addto(map);
                    }
                });
            }
            //Switch to a view showing the bus location on path if started
            //If bus driver, updated marker type to bus, this will be updated along the way

            if(Meteor.user().profile.role == "driver"){
                Meteor.call('changeMarkerToBus', document._id);
                marker.on('click', function(event){
                    //If they click again, remove it
                    map.removeLayer(marker);
                    Meteor.call('changeMarkerToStart', document._id);
                });
            }
            });
        }
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
