// src/hooks/usePoskos.ts
import { useEffect, useState } from "react";

export interface Posko {
  _id: string;
  name: string;
  partner?: string | null;
  pic?: string | null;
  lat: number;
  lng: number;
  disasterType: string;
  poskoTypes: string[];
  urgentNeeds: string[];
  volunteersCount: number;
  victimsCount: number;
  medicalStaffCount: number;
  contact: string;
  description: string;
  province?: { code: string; name: string } | null;
  regency?: { code: string; name: string } | null;
  district?: { code: string; name: string } | null;
  village?: { code: string; name: string } | null;
  createdAt?: string;
}

export function usePoskos() {
  const [poskos, setPoskos] = useState<Posko[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPoskos = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/poskos");
      const json = await res.json();

      if (json.success) {
        setPoskos(json.data || []);
      } else {
        console.error("API error:", json.message || "Unknown error");
        setPoskos([]);
      }
    } catch (err) {
      console.error("Failed to fetch poskos:", err);
      setPoskos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPoskos();
  }, []);

  return { poskos, loading, refetch: fetchPoskos };
}
