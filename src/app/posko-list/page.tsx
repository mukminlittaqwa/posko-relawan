"use client";

import { useState } from "react";
import { usePoskos, Posko } from "@/hooks/usePoskos";
import {
  Loader2,
  Phone,
  MapPinHouse,
  Users,
  Heart,
  Stethoscope,
  Copy,
  Search,
  Warehouse,
  Siren,
} from "lucide-react";
import Link from "next/link";

export default function PoskoListPage() {
  const { poskos, loading } = usePoskos();
  const [searchTerm, setSearchTerm] = useState("");

  const formatLocation = (p: Posko) => {
    const parts = [];
    if (p.village?.name) parts.push(p.village.name);
    if (p.district?.name) parts.push(p.district.name);
    if (p.regency?.name) parts.push(p.regency.name);
    if (p.province?.name) parts.push(p.province.name);
    return parts.length > 0 ? parts.join(", ") : "Lokasi belum ditentukan";
  };

  const getDisasterBadge = (type: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> =
      {
        banjir: {
          bg: "bg-blue-100 text-blue-800",
          text: "border-blue-300",
          label: "Banjir",
        },
        gempa_bumi: {
          bg: "bg-red-100 text-red-800",
          text: "border-red-300",
          label: "Gempa Bumi",
        },
        longsor: {
          bg: "bg-amber-100 text-amber-800",
          text: "border-amber-300",
          label: "Longsor",
        },
        tsunami: {
          bg: "bg-cyan-100 text-cyan-800",
          text: "border-cyan-300",
          label: "Tsunami",
        },
        gunung_api: {
          bg: "bg-orange-100 text-orange-800",
          text: "border-orange-300",
          label: "Gunung Api",
        },
        kebakaran_hutan: {
          bg: "bg-red-100 text-red-700",
          text: "border-red-300",
          label: "Kebakaran Hutan",
        },
        lainnya: {
          bg: "bg-purple-100 text-purple-800",
          text: "border-purple-300",
          label: "Lainnya",
        },
      };
    return badges[type] || badges.lainnya;
  };

  const getPoskoTypeBadge = (type: string) => {
    const labels: Record<string, string> = {
      logistik: "Logistik",
      kesehatan: "Kesehatan",
      "dapur umum": "Dapur Umum",
      shelter: "Shelter",
    };
    return labels[type] || type.charAt(0).toUpperCase() + type.slice(1);
  };

  const copyCoordinates = (lat: number, lng: number) => {
    navigator.clipboard.writeText(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    alert("Koordinat berhasil disalin!");
  };

  const filteredPoskos = poskos.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      formatLocation(p).toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-red-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-red-600 mx-auto mb-4" />
          <p className="text-xl font-medium text-gray-700">
            Memuat daftar posko...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-linear-to-br from-red-50 to-orange-50 py-2 px-2">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            Daftar Posko Bencana
          </h1>
          <p className="text-base text-gray-600">
            Total:{" "}
            <span className="font-bold text-red-600">
              {filteredPoskos.length}
            </span>{" "}
            posko aktif
          </p>

          <div className="max-w-md mx-auto mt-6 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari nama atau lokasi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 py-3 rounded-full border border-gray-300 focus:border-orange-400 outline-none shadow-md text-base"
            />
          </div>
        </div>
        <div className="hidden lg:block bg-white rounded-2xl shadow-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-linear-to-r from-red-600 to-orange-600 text-white">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold">
                  Posko & Koordinator
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold">
                  Bencana
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold">
                  Lokasi
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold">
                  Fasilitas
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold">
                  Kebutuhan
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold">
                  Statistik
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold">
                  Kontak
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredPoskos.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-gray-500">
                    {searchTerm
                      ? "Tidak ditemukan posko."
                      : "Belum ada posko yang dilaporkan."}
                  </td>
                </tr>
              ) : (
                filteredPoskos.map((p) => {
                  const disasterBadge = getDisasterBadge(p.disasterType);
                  return (
                    <tr key={p._id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-5">
                        <p className="font-semibold text-gray-800">{p.name}</p>
                        <div className="mt-1 text-sm text-gray-600">
                          {p.pic && <span>PIC: {p.pic} • </span>}
                          {p.partner && <span>Mitra: {p.partner}</span>}
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${disasterBadge.bg} border ${disasterBadge.text}`}
                        >
                          {disasterBadge.label}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <MapPinHouse className="w-5 h-5 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-800">
                              {formatLocation(p)}
                            </p>
                            {p.description && (
                              <p className="text-xs text-gray-500 mt-1">
                                {p.description}
                              </p>
                            )}
                            <button
                              onClick={() => copyCoordinates(p.lat, p.lng)}
                              className="text-xs text-orange-600 hover:underline mt-1 flex items-center gap-1"
                            >
                              <Copy className="w-3 h-3" />
                              Koordinat
                            </button>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <div className="flex items-center justify-center gap-2 mb-2 text-gray-700">
                          <Warehouse className="w-4 h-4 text-orange-600" />
                          <span className="text-xs font-medium">
                            Jenis Posko
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2 justify-center">
                          {(p.poskoTypes ?? []).length > 0 ? (
                            (p.poskoTypes ?? []).map((type) => (
                              <span
                                key={type}
                                className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full"
                              >
                                {getPoskoTypeBadge(type)}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-400 text-xs">-</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <div className="flex items-center justify-center gap-2 mb-2 text-red-700">
                          <Siren className="w-4 h-4" />
                          <span className="text-xs font-medium">
                            Kebutuhan Mendesak
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2 justify-center">
                          {(p.urgentNeeds ?? []).length > 0 ? (
                            (p.urgentNeeds ?? []).map((need) => (
                              <span
                                key={need}
                                className="px-3 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full"
                              >
                                {need}
                              </span>
                            ))
                          ) : (
                            <span className="text-green-600 text-xs font-medium">
                              Tidak ada
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="grid grid-cols-1 gap-5 text-center text-sm">
                          <div>
                            <Users className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                            <p className="font-bold text-blue-800">
                              {p.volunteersCount ?? 0}
                            </p>
                            <p className="text-gray-600">Relawan</p>
                          </div>
                          <div>
                            <Heart className="w-6 h-6 text-red-600 mx-auto mb-1" />
                            <p className="font-bold text-red-800">
                              {p.victimsCount ?? 0}
                            </p>
                            <p className="text-gray-600">Pengungsi</p>
                          </div>
                          <div>
                            <Stethoscope className="w-6 h-6 text-purple-600 mx-auto mb-1" />
                            <p className="font-bold text-purple-800">
                              {p.medicalStaffCount ?? 0}
                            </p>
                            <p className="text-gray-600">Medis</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        {p.contact ? (
                          <a
                            href={`https://wa.me/${p.contact.replace(
                              /\D/g,
                              ""
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-5 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-full shadow transition"
                          >
                            <Phone className="w-4 h-4" />
                            WhatsApp
                          </a>
                        ) : (
                          <span className="text-gray-400 text-xs">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="lg:hidden space-y-6">
          {filteredPoskos.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-10 text-center">
              <p className="text-gray-500 text-lg">
                {searchTerm
                  ? "Tidak ditemukan posko."
                  : "Belum ada posko yang dilaporkan."}
              </p>
            </div>
          ) : (
            filteredPoskos.map((p) => {
              const disasterBadge = getDisasterBadge(p.disasterType);
              return (
                <div
                  key={p._id}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden"
                >
                  <div
                    className={`p-4 text-white ${disasterBadge.bg.replace(
                      "100",
                      "600"
                    )}`}
                  >
                    <p className="text-sm opacity-90">Jenis Bencana</p>
                    <p className="text-xl font-bold">{disasterBadge.label}</p>
                  </div>
                  <div className="p-5 space-y-5">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">
                        {p.name}
                      </h3>
                      <div className="text-sm text-gray-600 mt-2">
                        {p.pic && <p>PIC: {p.pic}</p>}
                        {p.partner && <p>Mitra: {p.partner}</p>}
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center gap-3">
                        <MapPinHouse className="w-6 h-6 text-gray-600" />
                        <div>
                          <p className="font-medium text-gray-800">
                            {formatLocation(p)}
                          </p>
                          {p.description && (
                            <p className="text-sm text-gray-600 mt-1">
                              {p.description}
                            </p>
                          )}
                          <button
                            onClick={() => copyCoordinates(p.lat, p.lng)}
                            className="text-xs text-orange-600 hover:underline mt-2 flex items-center gap-1"
                          >
                            <Copy className="w-4 h-4" />
                            Salin koordinat
                          </button>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-3 text-gray-700">
                        <Warehouse className="w-5 h-5 text-orange-600" />
                        <p className="font-medium text-sm">Jenis Posko</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(p.poskoTypes ?? []).length > 0 ? (
                          (p.poskoTypes ?? []).map((type) => (
                            <span
                              key={type}
                              className="px-3 py-1.5 bg-orange-100 text-orange-700 text-xs font-medium rounded-lg"
                            >
                              {getPoskoTypeBadge(type)}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-3 text-red-700">
                        <Siren className="w-5 h-5" />
                        <p className="font-medium text-sm">
                          Kebutuhan Mendesak
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(p.urgentNeeds ?? []).length > 0 ? (
                          (p.urgentNeeds ?? []).map((need) => (
                            <span
                              key={need}
                              className="px-3 py-1.5 bg-red-100 text-red-700 text-xs font-medium rounded-lg"
                            >
                              {need}
                            </span>
                          ))
                        ) : (
                          <span className="text-green-600 text-sm">
                            Tidak ada
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 py-4 border-t border-gray-200 text-center">
                      <div>
                        <Users className="w-7 h-7 text-blue-600 mx-auto mb-1" />
                        <p className="text-xl font-bold text-blue-800">
                          {p.volunteersCount ?? 0}
                        </p>
                        <p className="text-xs text-gray-600">Relawan</p>
                      </div>
                      <div>
                        <Heart className="w-7 h-7 text-red-600 mx-auto mb-1" />
                        <p className="text-xl font-bold text-red-800">
                          {p.victimsCount ?? 0}
                        </p>
                        <p className="text-xs text-gray-600">Pengungsi</p>
                      </div>
                      <div>
                        <Stethoscope className="w-7 h-7 text-purple-600 mx-auto mb-1" />
                        <p className="text-xl font-bold text-purple-800">
                          {p.medicalStaffCount ?? 0}
                        </p>
                        <p className="text-xs text-gray-600">Medis</p>
                      </div>
                    </div>
                    {p.contact && (
                      <a
                        href={`https://wa.me/${p.contact.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-center py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl shadow transition"
                      >
                        <Phone className="w-5 h-5 inline mr-2" />
                        Hubungi via WhatsApp
                      </a>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
        <div className="text-center mt-12">
          <Link
            href="/"
            className="inline-block px-8 py-4 bg-linear-to-r from-red-600 to-orange-600 text-white font-bold rounded-full shadow-lg hover:shadow-xl transition"
          >
            ← Kembali ke Peta
          </Link>
        </div>
      </div>
    </div>
  );
}
