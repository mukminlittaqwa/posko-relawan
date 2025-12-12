import L from "leaflet";
import { renderToString } from "react-dom/server";
import { MapPin, AlertTriangle, House } from "lucide-react";

export const poskoIcon = L.divIcon({
  html: renderToString(<House size={32} color="#2563eb" strokeWidth={2} />),
  className: "lucide-marker",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

export const disasterIcon = L.divIcon({
  html: renderToString(
    <AlertTriangle size={36} color="#dc2626" strokeWidth={2.5} />
  ),
  className: "lucide-marker",
  iconSize: [36, 36],
  iconAnchor: [18, 36],
});
