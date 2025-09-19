import './App.css';
import "leaflet/dist/leaflet.css";

import {MapContainer, TileLayer, Marker, Popup} from "react-leaflet"
import MarkerClusterGroup from "react-leaflet-markercluster";

import { Icon, divIcon, point } from "leaflet";

const customIcon = new Icon({
  // iconUrl: "https://cdn-icons-png.flaticon.com/512/447/447031.png",
  iconUrl: require("./img/marker-icon.png"),
  iconSize: [38, 38]
});

const createClusterCustomIcon = function (cluster) {
  return new divIcon({
    html: `<span class="cluster-icon">${cluster.getChildCount()}</span>`,
    className: "custom-marker-cluster",
    iconSize: point(33, 33, true)
  });
};

const markers = [
  {
    geocode: [48.858370, 2.294481],
    popUp: "Tour Eiffel"
  },
  {
    geocode: [48.873792, 2.295028],
    popUp: "Arc de triomphe"
  },
  {
    geocode: [48.864824, 2.334595],
    popUp: "Musée du Louvre"
  }
];


function App() {
  return (
    <MapContainer center={[48.8566, 2.3522]} zoom={13}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MarkerClusterGroup
        chunkedLoading
        iconCreateFunction={createClusterCustomIcon}
      >
       {markers.map((marker) => (
          <Marker position={marker.geocode} icon={customIcon}>
            <Popup>{marker.popUp}</Popup>
          </Marker>
        ))}
      </MarkerClusterGroup>      
    </MapContainer>
    
  );
}

export default App;
