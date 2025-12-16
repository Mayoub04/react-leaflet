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

const createClusterCustomIcon = (cluster) => {
  return new divIcon({
    html: `<span class="cluster-icon">${cluster.getChildCount()}</span>`,
    className: "custom-marker-cluster",
    iconSize: point(33, 33, true)
  });
};

const SPOTS_API = "https://app-hilal-api.azurewebsites.net/api/spots";
const CONJUNCTION_API = "https://astro-app.wittymeadow-6c5bafb4.westeurope.azurecontainerapps.io/conjunction";

function App() {
  const [spots, setSpots] = useState([]);
  const [conjunction, setConjunction] = useState([]);

  
  useEffect(() => {
    const Spots = async () => {
      try {
        const res = await fetch(SPOTS_API);
        const data = await res.json();

        console.log("Spots API :", data);
        setSpots(data);
      } catch (error) {
        console.error("Erreur chargement spots :", error);
      }
    };

    Spots();
  }, []);

  
  useEffect(() => {
    if (spots.length === 0) return;

    const Conjunctions = async () => {
      try {
        const responses = await Promise.all(
          spots.map((spot) =>
            fetch(CONJUNCTION_API, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                start_year: 2025,
                start_month: 1,
                end_year: 2025,
                end_month: 2,
                obs_lat: spot.latitude,
                obs_lon: spot.longitude,
                obs_elev: 105,
                temperature_c: 10,
                pressure_mbar: 1010,
                user_choice: "1",
                user_day_choice: "5"
              })
            }).then((r) => r.json())
          )
        );

        console.log("Conjunction API :", responses);
        setConjunction(responses);
      } catch (error) {
        console.error("Erreur des chargmements des conjonctions :", error);
      }
    };

    Conjunctions();
  }, [spots]);

  return (
    <MapContainer
      center={[49.0, 1.7]}
      zoom={8}
      style={{ height: "100vh", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MarkerClusterGroup
        chunkedLoading
        iconCreateFunction={createClusterCustomIcon}
      >
        {spots.map((spot, index) => (
          <Marker
            key={spot.id}
            position={[spot.latitude, spot.longitude]}
            icon={customIcon}
          >
            <Tooltip direction="top" offset={[0, -20]} opacity={1} sticky>
              <div style={{ maxWidth: "300px" }}>
                <strong>{spot.city} ({spot.zipCode})</strong>
                <pre style={{ whiteSpace: "pre-wrap" }}>
                  {JSON.stringify(conjunction[index], null, 2)}
                </pre>
              </div>
            </Tooltip>
          </Marker>
        ))}
      </MarkerClusterGroup>
    </MapContainer>
  );
}

export default App;
