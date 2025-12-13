"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { Posko } from "@/hooks/usePoskos";

const LeafletMapClient = dynamic(() => import("./LeafletMapClient"), {
  ssr: false,
});

interface Props {
  poskos: Posko[];
  onMapClick: (lat: number, lng: number) => void;
}

export default function MapComponent({ poskos, onMapClick }: Props) {
  const [hasMounted, setHasMounted] = useState(false);

  if (typeof window !== "undefined" && !hasMounted) {
    setHasMounted(true);
  }

  if (!hasMounted) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <p className="text-lg font-medium">Memuat peta...</p>
      </div>
    );
  }

  return <LeafletMapClient poskos={poskos} onMapClick={onMapClick} />;
}
