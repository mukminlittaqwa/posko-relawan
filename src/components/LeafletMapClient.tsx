"use client";

import "leaflet/dist/leaflet.css";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import { renderToStaticMarkup } from "react-dom/server";
import { Waves, AlertTriangle, Mountain, Flame, Siren } from "lucide-react";

if (typeof window !== "undefined") {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl:
      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
}

const iconCache = new Map<string, L.DivIcon>();

const getLucideIcon = (type: string): L.DivIcon => {
  if (iconCache.has(type)) return iconCache.get(type)!;

  const config: Record<string, { Icon: any; color: string }> = {
    banjir: { Icon: Waves, color: "#3b82f6" },
    gempa_bumi: { Icon: AlertTriangle, color: "#ef4444" },
    longsor: { Icon: Mountain, color: "#f59e0b" },
    tsunami: { Icon: Waves, color: "#1d4ed8" },
    gunung_api: { Icon: Flame, color: "#f97316" },
    kebakaran_hutan: { Icon: Flame, color: "#dc2626" },
    lainnya: { Icon: Siren, color: "#8b5cf6" },
  };

  const { Icon: LucideIcon, color } = config[type] || config.lainnya;

  const svgString = renderToStaticMarkup(
    <LucideIcon size={24} strokeWidth={2.5} color="white" />
  );

  const html = `
    <div style="position:relative;width:44px;height:60px;">
      <div style="background:${color};width:44px;height:44px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 16px rgba(0,0,0,0.3);border:4px solid white;">
        ${svgString}
      </div>
      <div style="position:absolute;top:42px;left:50%;transform:translateX(-50%);
                  border-left:10px solid transparent;border-right:10px solid transparent;
                  border-top:16px solid ${color};filter:drop-shadow(0 2px 4px rgba(0,0,0,0.3));">
      </div>
    </div>
  `;

  const icon = L.divIcon({
    html,
    className: "lucide-marker",
    iconSize: [44, 60],
    iconAnchor: [22, 60],
    popupAnchor: [0, -56],
  });

  iconCache.set(type, icon);
  return icon;
};

function MapClickHandler({
  onClick,
}: {
  onClick: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click: (e) => onClick(e.latlng.lat, e.latlng.lng),
  });
  return null;
}

interface Posko {
  _id: string;
  name: string;
  lat: number;
  lng: number;
  disasterType: string;
  urgentNeeds: string[];
  volunteers: number;
  victims: number;
  contact: string;
}

interface Props {
  poskos: Posko[];
  onMapClick: (lat: number, lng: number) => void;
}

export default function LeafletMapClient({ poskos, onMapClick }: Props) {
  return (
    <MapContainer
      center={[-2.5, 118]}
      zoom={5}
      style={{ height: "100vh", width: "100vw" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />

      <MapClickHandler onClick={onMapClick} />

      {poskos.map((p) => (
        <Marker
          key={p._id}
          position={[p.lat, p.lng]}
          icon={getLucideIcon(p.disasterType)}
        >
          <Popup>
            <div className="p-3 max-w-xs">
              <h3 className="font-bold text-lg mb-2">{p.name}</h3>
              <p className="text-sm">
                <strong>Jenis:</strong> {p.disasterType.replace(/_/g, " ")}
              </p>
              {p.urgentNeeds.length > 0 && (
                <p className="text-sm text-red-600 font-medium mt-2">
                  Butuh: {p.urgentNeeds.join(", ")}
                </p>
              )}
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div className="bg-blue-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-blue-700">
                    {p.volunteers}
                  </p>
                  <p className="text-xs">Relawan</p>
                </div>
                <div className="bg-red-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-red-700">{p.victims}</p>
                  <p className="text-xs">Korban</p>
                </div>
              </div>
              {p.contact && (
                <p className="mt-3 text-sm">
                  <strong>Kontak:</strong>{" "}
                  <a
                    href={`https://wa.me/${p.contact.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-600 font-bold underline"
                  >
                    {p.contact}
                  </a>
                </p>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
