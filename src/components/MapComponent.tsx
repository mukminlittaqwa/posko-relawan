"use client";

import "leaflet/dist/leaflet.css";
import "@/components/leaflet-fix";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const MapContainer = dynamic(
  () => import("react-leaflet").then((m) => m.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((m) => m.TileLayer),
  { ssr: false }
);
const Marker = dynamic(() => import("react-leaflet").then((m) => m.Marker), {
  ssr: false,
});
const Popup = dynamic(() => import("react-leaflet").then((m) => m.Popup), {
  ssr: false,
});

import { useMapEvents } from "react-leaflet";

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
  description: string;
}

interface Props {
  poskos: Posko[];
  onMapClick: (lat: number, lng: number) => void;
}

function MapEvents({
  onClick,
}: {
  onClick: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click: (e) => {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function MapComponent({ poskos, onMapClick }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100 text-lg">
        Memuat peta...
      </div>
    );
  }

  return (
    <MapContainer
      center={[0.5, 101.5]}
      zoom={8}
      style={{ height: "100vh", width: "100vw" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />

      <MapEvents onClick={onMapClick} />

      {poskos.map((p) => (
        <Marker key={p._id} position={[p.lat, p.lng]}>
          <Popup>
            <div className="text-sm max-w-xs">
              <h3 className="font-bold text-base">{p.name}</h3>
              <p>
                <strong>Jenis:</strong> {p.disasterType.replace(/_/g, " ")}
              </p>
              {p.urgentNeeds.length > 0 && (
                <p>
                  <strong>Butuh:</strong> {p.urgentNeeds.join(", ")}
                </p>
              )}
              <p>Relawan: {p.volunteers} orang</p>
              <p>Korban: {p.victims} orang</p>
              {p.contact && (
                <p>
                  <strong>Kontak:</strong> {p.contact}
                </p>
              )}
              <p className="text-gray-600 mt-2 text-xs">{p.description}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
