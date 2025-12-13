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
  Stethoscope,
  Building2,
  User,
  Handshake,
  MapPinHouse,
} from "lucide-react";
import { Posko } from "@/hooks/usePoskos";

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

interface Props {
  poskos: Posko[];
  onMapClick: (lat: number, lng: number) => void;
}

export default function LeafletMapClient({ poskos, onMapClick }: Props) {
  const getDisasterColor = (type: string) => {
    const colors: Record<string, string> = {
      banjir: "from-blue-500 to-blue-700",
      gempa_bumi: "from-red-600 to-red-800",
      longsor: "from-amber-500 to-amber-700",
      tsunami: "from-cyan-600 to-blue-800",
      gunung_api: "from-orange-500 to-red-600",
      kebakaran_hutan: "from-red-700 to-orange-800",
      lainnya: "from-purple-600 to-pink-600",
    };
    return colors[type] || colors.lainnya;
  };

  const getPoskoTypeBadge = (type: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> =
      {
        logistik: {
          bg: "bg-blue-100 text-blue-800",
          text: "border-blue-300",
          label: "Logistik",
        },
        kesehatan: {
          bg: "bg-purple-100 text-purple-800",
          text: "border-purple-300",
          label: "Kesehatan",
        },
        "dapur umum": {
          bg: "bg-orange-100 text-orange-800",
          text: "border-orange-300",
          label: "Dapur Umum",
        },
        shelter: {
          bg: "bg-green-100 text-green-800",
          text: "border-green-300",
          label: "Shelter",
        },
      };
    return (
      badges[type] || {
        bg: "bg-gray-100 text-gray-800",
        text: "border-gray-300",
        label: type.charAt(0).toUpperCase() + type.slice(1),
      }
    );
  };

  const formatLocation = (p: Posko) => {
    const parts = [];
    if (p.village?.name) parts.push(p.village.name);
    if (p.district?.name) parts.push(p.district.name);
    if (p.regency?.name) parts.push(p.regency.name);
    if (p.province?.name) parts.push(p.province.name);
    return parts.length > 0 ? parts.join(", ") : "-";
  };

  return (
    <MapContainer
      center={[-2.5, 118]}
      zoom={5}
      style={{ height: "100vh", width: "100vw" }}
      className="z-0"
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
          <Popup maxWidth={420} minWidth={320} closeButton={false}>
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-4 border-white">
              {/* Header Bencana */}
              <div
                className={`relative h-32 flex items-center justify-center text-white bg-linear-to-br ${getDisasterColor(
                  p.disasterType
                )}`}
              >
                <div className="absolute inset-0 opacity-20 bg-white/20 backdrop-blur-sm"></div>
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

              {/* Body Popup */}
              <div className="p-6 max-h-96 overflow-y-auto scrollbar-hidden">
                <h3 className="text-2xl font-black text-gray-800 text-center mb-4">
                  {p.name}
                </h3>

                {/* Jenis Posko */}
                {(p.poskoTypes ?? []).length > 0 && (
                  <div className="flex flex-wrap gap-2 justify-center mb-5">
                    {(p.poskoTypes ?? []).map((type) => {
                      const badge = getPoskoTypeBadge(type);
                      return (
                        <span
                          key={type}
                          className={`px-4 py-2 rounded-full font-bold text-sm ${badge.bg} border-2 ${badge.text}`}
                        >
                          {badge.label}
                        </span>
                      );
                    })}
                  </div>
                )}

                {/* Lokasi Administratif */}
                <div className="mb-5 p-4 bg-linear-to-rrom-teal-50 to-cyan-50 rounded-2xl border-2 border-teal-200">
                  <div className="flex items-center gap-2 text-teal-800 font-bold mb-2">
                    <MapPinHouse className="w-6 h-6" />
                    Lokasi
                  </div>
                  <p className="text-gray-700 font-medium">
                    {formatLocation(p)}
                  </p>
                </div>

                {/* Informasi Koordinator */}
                <div className="mb-6 p-5 bg-linear-to-br from-indigo-50 to-purple-50 rounded-2xl border-2 border-indigo-200 shadow-lg">
                  <h4 className="font-bold text-indigo-800 text-lg mb-4 text-center flex items-center justify-center gap-2">
                    <Building2 className="w-6 h-6" />
                    Informasi Koordinator
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 bg-white/70 backdrop-blur-sm px-5 py-4 rounded-xl shadow">
                      <div className="p-3 bg-indigo-100 rounded-full">
                        <User className="w-7 h-7 text-indigo-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-600 font-medium">
                          Penanggung Jawab (PIC)
                        </p>
                        <p className="text-lg font-bold text-indigo-800">
                          {p.pic || "-"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 bg-white/70 backdrop-blur-sm px-5 py-4 rounded-xl shadow">
                      <div className="p-3 bg-purple-100 rounded-full">
                        <Handshake className="w-7 h-7 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-600 font-medium">
                          Mitra / Kolaborator
                        </p>
                        <p className="text-lg font-bold text-purple-800">
                          {p.partner || "-"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Kebutuhan Mendesak */}
                {(p.urgentNeeds ?? []).length > 0 && (
                  <div className="mb-6 p-5 bg-linear-to-r from-red-50 to-pink-50 rounded-2xl border-2 border-red-200">
                    <p className="font-bold text-red-700 text-lg mb-3 text-center">
                      Butuh Segera
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {(p.urgentNeeds ?? []).map((need, i) => (
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

                {/* Statistik - Rapi, Minimalis, Elegan */}
                <div className="space-y-3 mb-7">
                  {/* Relawan */}
                  <div className="flex items-center justify-between bg-blue-50/80 backdrop-blur-sm px-5 py-3 rounded-xl border border-blue-200">
                    <div className="flex items-center gap-4">
                      <Users className="w-8 h-8 text-blue-600" />
                      <span className="text-sm font-semibold text-blue-800">
                        Relawan
                      </span>
                    </div>
                    <span className="text-2xl font-bold text-blue-900">
                      {p.volunteersCount ?? 0}
                    </span>
                  </div>

                  <div className="flex items-center justify-between bg-red-50/80 backdrop-blur-sm px-5 py-3 rounded-xl border border-red-200">
                    <div className="flex items-center gap-4">
                      <Heart className="w-8 h-8 text-red-600" />
                      <span className="text-sm font-semibold text-red-800">
                        Pengungsi
                      </span>
                    </div>
                    <span className="text-2xl font-bold text-red-900">
                      {p.victimsCount ?? 0}
                    </span>
                  </div>

                  <div className="flex items-center justify-between bg-purple-50/80 backdrop-blur-sm px-5 py-3 rounded-xl border border-purple-200">
                    <div className="flex items-center gap-4">
                      <Stethoscope className="w-8 h-8 text-purple-600" />
                      <span className="text-sm font-semibold text-purple-800">
                        Tenaga Medis
                      </span>
                    </div>
                    <span className="text-2xl font-bold text-purple-900">
                      {p.medicalStaffCount ?? 0}
                    </span>
                  </div>
                </div>

                {p.contact && (
                  <div className="text-center mb-5">
                    <a
                      href={`https://wa.me/${p.contact.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-3 px-8 py-4  text-white font-bold text-lg rounded-full shadow-2xl transform hover:scale-105 transition-all duration-300"
                    >
                      <Phone className="w-7 h-7" />
                      HUBUNGI VIA WHATSAPP
                    </a>
                  </div>
                )}

                {p.description && (
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200">
                    <p className="text-sm text-gray-700 leading-relaxed">
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
