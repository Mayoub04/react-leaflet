import React, { useState, useEffect } from "react";
import './App.css';
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-markercluster";
import { Icon, divIcon, point } from "leaflet";
import axios from "axios";

// Icône personnalisée
const customIcon = new Icon({
  iconUrl: require("./img/marker-icon.png"),
  iconSize: [38, 38]
});

// Icône pour clusters
const createClusterCustomIcon = function(cluster) {
  return new divIcon({
    html: `<span class="cluster-icon">${cluster.getChildCount()}</span>`,
    className: "custom-marker-cluster",
    iconSize: point(33, 33, true)
  });
};

// Styles pour le Popup type "card"
const popupCardStyle = {
  backgroundColor: "#f9f9f9",
  borderRadius: "10px",
  padding: "10px",
  boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
  minWidth: "250px",
  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
};

const tableCellStyle = {
  padding: "4px 8px",
  borderBottom: "1px solid #ddd",
};

const tableHeaderStyle = {
  ...tableCellStyle,
  fontWeight: "bold",
  color: "#333",
  backgroundColor: "#e6f0ff",
};

function App() {
  const [markers, setMarkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const payload = {
    start_year: 2025,
    start_month: 1,
    end_year: 2025,
    end_month: 2,
    obs_lat: 49.0075,
    obs_lon: 1.7166667,
    obs_elev: 105,
    temperature_c: 10,
    pressure_mbar: 1010,
    user_choice: "1",
    user_day_choice: "5"
  };

  useEffect(() => {
    axios
      .post("https://astro-app.wittymeadow-6c5bafb4.westeurope.azurecontainerapps.io/conjunction", payload)
      .then((res) => {
        if (res.data.status === "ok") {
          const filteredKeys = [
            "Nouvelle Lune TOPOCENTRIQUE",
            "Mois hégirien correspondant",
            "- Calcul base on Sunset",
            "- Visibilité selon Odeh"
          ];

          const mapped = res.data.parsed_days.map((item, idx) => ({
            geocode: [payload.obs_lat, payload.obs_lon],
            popUp: (
              <div style={popupCardStyle}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <tbody>
                    {filteredKeys.map((key, i) =>
                      item[key] ? (
                        <tr key={i}>
                          <td style={tableHeaderStyle}>{key}</td>
                          <td style={tableCellStyle}>{item[key]}</td>
                        </tr>
                      ) : null
                    )}
                    <tr>
                      <td style={tableHeaderStyle}>Latitude</td>
                      <td style={tableCellStyle}>{payload.obs_lat}</td>
                    </tr>
                    <tr>
                      <td style={tableHeaderStyle}>Longitude</td>
                      <td style={tableCellStyle}>{payload.obs_lon}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )
          }));

          setMarkers(mapped);
        } else {
          setError("L'API a renvoyé un statut non-ok.");
        }
      })
      .catch((err) => {
        console.error("Erreur API :", err);
        setError("Impossible de charger les données.");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Chargement des données astronomiques...</p>;
  if (error) return <p>{error}</p>;

  return (
    <MapContainer center={[payload.obs_lat, payload.obs_lon]} zoom={6} style={{ height: "100vh", width: "100%" }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MarkerClusterGroup chunkedLoading iconCreateFunction={createClusterCustomIcon}>
        {markers.map((marker, idx) => (
          <Marker key={idx} position={marker.geocode} icon={customIcon}>
            <Popup>{marker.popUp}</Popup>
          </Marker>
        ))}
      </MarkerClusterGroup>
    </MapContainer>
  );
}

export default App;
