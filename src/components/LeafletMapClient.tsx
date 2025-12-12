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
          <Popup
            maxWidth={420}
            minWidth={320}
            closeButton={false}
            className="custom-popup"
          >
            <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden border-4 border-white">
              {/* Header Gradient + Icon Bencana */}
              <div
                className={`relative h-32 flex items-center justify-center text-white overflow-hidden
      ${
        p.disasterType === "banjir"
          ? "bg-gradient-to-br from-blue-500 to-blue-700"
          : p.disasterType === "gempa_bumi"
          ? "bg-gradient-to-br from-red-600 to-red-800"
          : p.disasterType === "longsor"
          ? "bg-gradient-to-br from-amber-500 to-amber-700"
          : p.disasterType === "tsunami"
          ? "bg-gradient-to-br from-cyan-600 to-blue-800"
          : p.disasterType === "gunung_api"
          ? "bg-gradient-to-br from-orange-500 to-red-600"
          : p.disasterType === "kebakaran_hutan"
          ? "bg-gradient-to-br from-red-700 to-orange-800"
          : "bg-gradient-to-br from-purple-600 to-pink-600"
      }`}
              >
                {/* Background Pattern Halus */}
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute inset-0 bg-white/20 backdrop-blur-sm"></div>
                </div>

                <div className="relative z-10 text-center">
                  <div className="mb-2">
                    {p.disasterType === "banjir" && (
                      <Waves className="w-16 h-16 mx-auto" />
                    )}
                    {p.disasterType === "gempa_bumi" && (
                      <AlertTriangle className="w-16 h-16 mx-auto" />
                    )}
                    {p.disasterType === "longsor" && (
                      <Mountain className="w-16 h-16 mx-auto" />
                    )}
                    {p.disasterType === "tsunami" && (
                      <Waves className="w-16 h-16 mx-auto" />
                    )}
                    {p.disasterType === "gunung_api" && (
                      <Flame className="w-16 h-16 mx-auto" />
                    )}
                    {p.disasterType === "kebakaran_hutan" && (
                      <Flame className="w-16 h-16 mx-auto" />
                    )}
                    {p.disasterType === "lainnya" && (
                      <Siren className="w-16 h-16 mx-auto" />
                    )}
                  </div>
                  <p className="text-xl font-bold tracking-wider uppercase">
                    {p.disasterType.replace(/_/g, " ")}
                  </p>
                </div>
              </div>

              {/* Body - BISA SCROLL TAPI SCROLLBAR DISEMBUNYIKAN */}
              <div className="p-6 max-h-96 overflow-y-auto scrollbar-hidden">
                {/* Nama Posko */}
                <h3 className="text-2xl font-black text-gray-800 mb-4 text-center leading-tight">
                  {p.name}
                </h3>

                {/* Kebutuhan Mendesak */}
                {p.urgentNeeds.length > 0 && (
                  <div className="mb-6 p-5 bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl border-2 border-red-200">
                    <p className="font-bold text-red-700 text-lg mb-3 text-center">
                      Butuh Segera
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {p.urgentNeeds.map((need, i) => (
                        <span
                          key={i}
                          className="px-4 py-2 bg-red-600 text-white font-bold text-sm rounded-full shadow-md"
                        >
                          {need}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Statistik Relawan & Korban */}
                <div className="grid grid-cols-2 gap-5 mb-6">
                  <div className="text-center p-5 bg-gradient-to-br from-blue-50 via-blue-100 to-blue-50 rounded-3xl border-4 border-blue-200 shadow-inner">
                    <Users className="w-12 h-12 mx-auto text-blue-700 mb-2" />
                    <p className="text-4xl font-black text-blue-700">
                      {p.volunteersCount}
                    </p>
                    <p className="text-sm font-bold text-blue-600 mt-1">
                      RELAWAN
                    </p>
                  </div>
                  <div className="text-center p-5 bg-gradient-to-br from-red-50 via-red-100 to-red-50 rounded-3xl border-4 border-red-200 shadow-inner">
                    <Heart className="w-12 h-12 mx-auto text-red-700 mb-2" />
                    <p className="text-4xl font-black text-red-700">
                      {p.victims}
                    </p>
                    <p className="text-sm font-bold text-red-600 mt-1">
                      PENGUNGSI
                    </p>
                  </div>
                </div>

                {/* Kontak WhatsApp */}
                {p.contact && (
                  <div className="text-center mb-5">
                    <a
                      href={`https://wa.me/${p.contact.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-3 px-8 py-5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold text-lg rounded-full shadow-2xl transform hover:scale-105 transition-all duration-300"
                    >
                      <Phone className="w-7 h-7" />
                      HUBUNGI KOORDINATOR
                    </a>
                  </div>
                )}

                {/* Deskripsi */}
                {p.description && (
                  <div className="mt-5 p-5 bg-gradient-to-b from-gray-50 to-gray-100 rounded-2xl border border-gray-300">
                    <p className="text-sm text-gray-700 leading-relaxed text-justify">
                      {p.description}
                    </p>
                  </div>
                )}

                {/* Tombol Tutup Keren */}
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
