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
import {
  Waves,
  AlertTriangle,
  Mountain,
  Flame,
  Siren,
  Users,
  Heart,
  Phone,
} from "lucide-react";

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
  volunteersCount: number;
  victims: number;
  contact: string;
  description: string;
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
          <Popup maxWidth={400} minWidth={300} closeButton={true}>
            <div className="w-full max-w-sm font-sans">
              <div
                className={`p-4 rounded-t-2xl text-white font-bold text-center text-lg shadow-lg
      ${
        p.disasterType === "banjir"
          ? "bg-blue-600"
          : p.disasterType === "gempa_bumi"
          ? "bg-red-600"
          : p.disasterType === "longsor"
          ? "bg-yellow-600"
          : p.disasterType === "tsunami"
          ? "bg-blue-800"
          : p.disasterType === "gunung_api"
          ? "bg-orange-600"
          : p.disasterType === "kebakaran_hutan"
          ? "bg-red-700"
          : "bg-purple-600"
      }`}
              >
                <div className="flex items-center justify-center gap-3">
                  {p.disasterType === "banjir" && <Waves className="w-7 h-7" />}
                  {p.disasterType === "gempa_bumi" && (
                    <AlertTriangle className="w-7 h-7" />
                  )}
                  {p.disasterType === "longsor" && (
                    <Mountain className="w-7 h-7" />
                  )}
                  {p.disasterType === "tsunami" && (
                    <Waves className="w-7 h-7" />
                  )}
                  {p.disasterType === "gunung_api" && (
                    <Flame className="w-7 h-7" />
                  )}
                  {p.disasterType === "kebakaran_hutan" && (
                    <Flame className="w-7 h-7" />
                  )}
                  {p.disasterType === "lainnya" && (
                    <Siren className="w-7 h-7" />
                  )}
                  <span className="uppercase tracking-wider">
                    {p.disasterType.replace(/_/g, " ")}
                  </span>
                </div>
              </div>

              <div className="p-5 bg-white rounded-b-2xl max-h-96 overflow-y-auto">
                <h3 className="text-2xl font-bold text-gray-800 mb-4 leading-tight">
                  {p.name}
                </h3>

                {p.urgentNeeds.length > 0 && (
                  <div className="mb-5 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                    <p className="font-bold text-red-700 mb-2 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" />
                      Butuh Segera:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {p.urgentNeeds.map((need, i) => (
                        <span
                          key={i}
                          className="px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded-full"
                        >
                          {need}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 mb-5">
                  <div className="bg-linear-to-br from-blue-50 to-blue-100 p-4 rounded-2xl text-center border-2 border-blue-200">
                    <Users className="w-10 h-10 mx-auto text-blue-700 mb-2" />
                    <p className="text-3xl font-bold text-blue-700">
                      {p.volunteersCount}
                    </p>
                    <p className="text-sm text-gray-600">Relawan</p>
                  </div>
                  <div className="bg-linear-to-br from-red-50 to-red-100 p-4 rounded-2xl text-center border-2 border-red-200">
                    <Heart className="w-10 h-10 mx-auto text-red-700 mb-2" />
                    <p className="text-3xl font-bold text-red-700">
                      {p.victims}
                    </p>
                    <p className="text-sm text-gray-600">Pengungsi</p>
                  </div>
                </div>

                {p.contact && (
                  <div className="bg-green-50 p-4 rounded-xl border-2 border-green-200 mb-4">
                    <p className="font-bold text-green-800 mb-2 flex items-center gap-2">
                      <Phone className="w-5 h-5" />
                      Kontak Koordinator
                    </p>
                    <a
                      href={`https://wa.me/${p.contact.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-md transition"
                    >
                      <Phone className="w-5 h-5" />
                      {p.contact}
                    </a>
                  </div>
                )}

                {p.description && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {p.description}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
