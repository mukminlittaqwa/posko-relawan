"use client";

import MapComponent from "@/components/MapComponent";
import ReportPoskoButton from "@/components/ReportPoskoButton";
import ReportPoskoModal from "@/components/ReportPoskoModal";
import { Loader2 } from "lucide-react";
import { usePoskos } from "@/hooks/usePoskos";
import { useState } from "react";

export default function Home() {
  const { poskos, loading, refetch } = usePoskos();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      {loading ? (
        <div className="h-screen flex items-center justify-center bg-linear-to-br from-red-50 to-orange-50">
          <Loader2 className="w-16 h-16 animate-spin text-red-600" />
        </div>
      ) : (
        <MapComponent poskos={poskos} onMapClick={() => {}} />
      )}

      <ReportPoskoButton onClick={() => setModalOpen(true)} />
      <ReportPoskoModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={refetch}
      />
    </>
  );
}
