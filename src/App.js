import './App.css';
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Tooltip } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-markercluster";
import { Icon, divIcon, point } from "leaflet";
import { useEffect, useState } from 'react';

const customIcon = new Icon({
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
  { geocode: { lat: 48.858370, lng: 2.294481 } }, 
  { geocode: { lat: 48.873792, lng: 2.295028 } }, 
  { geocode: { lat: 48.864824, lng: 2.334595 } }  
];

const API = "https://astro-app.wittymeadow-6c5bafb4.westeurope.azurecontainerapps.io/conjunction";

function App() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const Api = async () => {
      try {
        const res = await Promise.all(
          markers.map((m) =>
            fetch(API, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                start_year: 2025,
                start_month: 1,
                end_year: 2025,
                end_month: 2,
                obs_lat: m.geocode.lat,
                obs_lon: m.geocode.lng,
                obs_elev: 105,
                temperature_c: 10,
                pressure_mbar: 1010,
                user_choice: "1",
                user_day_choice: "5"
              })
            }).then((r) => r.json())
          )
        );

        console.log("Réponse API :", res);
        setData(res);

      } catch (error) {
        console.error("Erreur API :", error);
      }
    };

    Api();
  }, []);

  return (
    <MapContainer center={[48.8566, 2.3522]} zoom={13}>
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MarkerClusterGroup
        chunkedLoading
        iconCreateFunction={createClusterCustomIcon}
      >

        {markers.map((marker, index) => (
          <Marker
            key={index}
            position={[marker.geocode.lat, marker.geocode.lng]}
            icon={customIcon}
          >
            <Tooltip 
              direction="top" 
              offset={[0, -20]} 
              opacity={1} 
              sticky
            >
              <pre>{JSON.stringify(data[index], null, 2)}</pre>
            </Tooltip>
          </Marker>
        ))}

      </MarkerClusterGroup>
    </MapContainer>
  );
}

export default App;
