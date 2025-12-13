"use client";

import { useEffect, useState } from "react";
import {
  MapPin,
  Users,
  Heart,
  Phone,
  AlertTriangle,
  Loader2,
  Stethoscope,
  Loader,
} from "lucide-react";
import { usePoskos } from "@/hooks/usePoskos";

const disasterTypes = [
  "Banjir",
  "Gempa Bumi",
  "Longsor",
  "Tsunami",
  "Gunung Api",
  "Kebakaran Hutan",
  "Lainnya",
];

const needsList = [
  "Makanan",
  "Air Bersih",
  "Obat",
  "Selimut",
  "Tenda",
  "Pakaian",
  "Pembalut",
  "Susu Bayi",
  "Popok",
  "Alat Mandi",
];

const jenisPoskoList = ["logistik", "kesehatan", "dapur umum", "shelter"];

interface Wilayah {
  code: string;
  name: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ReportPoskoModal({ open, onClose }: Props) {
  const { refetch } = usePoskos();
  const [locating, setLocating] = useState(false);

  const [form, setForm] = useState({
    name: "",
    partner: "",
    pic: "",
    lat: "",
    lng: "",
    disasterType: "banjir",
    poskoTypes: [] as string[],
    urgentNeeds: [] as string[],
    volunteers: "",
    victims: "",
    medicalStaff: "",
    contact: "",
    description: "",
    provinceCode: "",
    provinceName: "",
    regencyCode: "",
    regencyName: "",
    districtCode: "",
    districtName: "",
    villageCode: "",
    villageName: "",
  });

  const [provinces, setProvinces] = useState<Wilayah[]>([]);
  const [regencies, setRegencies] = useState<Wilayah[]>([]);
  const [districts, setDistricts] = useState<Wilayah[]>([]);
  const [villages, setVillages] = useState<Wilayah[]>([]);

  const [loadingProv, setLoadingProv] = useState(true);
  const [loadingReg, setLoadingReg] = useState(false);
  const [loadingDist, setLoadingDist] = useState(false);
  const [loadingVill, setLoadingVill] = useState(false);

  useEffect(() => {
    if (open) {
      setLoadingProv(true);
      fetch("/api/wilayah/provinces")
        .then((r) => {
          if (!r.ok) throw new Error("Gagal fetch provinsi");
          return r.json();
        })
        .then((d) => {
          setProvinces(d);
          setLoadingProv(false);
        })
        .catch((err) => {
          console.error(err);
          alert("Gagal memuat data provinsi. Cek console untuk detail.");
          setLoadingProv(false);
        });

      setForm({
        name: "",
        partner: "",
        pic: "",
        lat: "",
        lng: "",
        disasterType: "banjir",
        poskoTypes: [],
        urgentNeeds: [],
        volunteers: "",
        victims: "",
        medicalStaff: "",
        contact: "",
        description: "",
        provinceCode: "",
        provinceName: "",
        regencyCode: "",
        regencyName: "",
        districtCode: "",
        districtName: "",
        villageCode: "",
        villageName: "",
      });
      setRegencies([]);
      setDistricts([]);
      setVillages([]);
      openLocation();
    }
  }, [open]);

  useEffect(() => {
    if (form.provinceCode) {
      setLoadingReg(true);
      fetch(`/api/wilayah/regencies/${form.provinceCode}`)
        .then((r) => r.json())
        .then((d) => {
          setRegencies(d);
          setLoadingReg(false);
        })
        .catch(() => {
          alert("Gagal memuat kabupaten/kota.");
          setLoadingReg(false);
        });
    } else {
      setRegencies([]);
      setDistricts([]);
      setVillages([]);
    }
  }, [form.provinceCode]);

  useEffect(() => {
    if (form.regencyCode) {
      setLoadingDist(true);
      fetch(`api/wilayah/districts/${form.regencyCode}`)
        .then((r) => r.json())
        .then((d) => {
          setDistricts(d);
          setLoadingDist(false);
        })
        .catch(() => {
          alert("Gagal memuat kecamatan.");
          setLoadingDist(false);
        });
    } else {
      setDistricts([]);
      setVillages([]);
    }
  }, [form.regencyCode]);

  useEffect(() => {
    if (form.districtCode) {
      setLoadingVill(true);
      fetch(`/api/wilayah/villages/${form.districtCode}`)
        .then((r) => r.json())
        .then((d) => {
          setVillages(d);
          setLoadingVill(false);
        })
        .catch(() => {
          alert("Gagal memuat desa/kelurahan.");
          setLoadingVill(false);
        });
    } else {
      setVillages([]);
    }
  }, [form.districtCode]);

  const openLocation = () => {
    if (!navigator.geolocation) {
      alert("Browser tidak mendukung GPS. Isi koordinat manual ya.");
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((f) => ({
          ...f,
          lat: pos.coords.latitude.toFixed(6),
          lng: pos.coords.longitude.toFixed(6),
        }));
        setLocating(false);
      },
      (error) => {
        let message = "Gagal ambil lokasi.";
        if (error.code === 1) message = "Izin lokasi ditolak.";
        if (error.code === 2) message = "Lokasi tidak tersedia.";
        if (error.code === 3) message = "Timeout mengambil lokasi.";
        alert(message + " Silakan isi manual.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  const togglePoskoType = (item: string) => {
    setForm((f) => ({
      ...f,
      poskoTypes: f.poskoTypes.includes(item)
        ? f.poskoTypes.filter((i) => i !== item)
        : [...f.poskoTypes, item],
    }));
  };

  const toggleNeed = (item: string) => {
    setForm((f) => ({
      ...f,
      urgentNeeds: f.urgentNeeds.includes(item)
        ? f.urgentNeeds.filter((i) => i !== item)
        : [...f.urgentNeeds, item],
    }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.lat || !form.lng) {
      alert("Nama posko dan lokasi wajib diisi!");
      return;
    }

    await fetch("/api/poskos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        partner: form.partner || null,
        pic: form.pic || null,
        lat: parseFloat(form.lat),
        lng: parseFloat(form.lng),
        disasterType: form.disasterType,
        poskoTypes: form.poskoTypes,
        urgentNeeds: form.urgentNeeds,
        volunteersCount: Number(form.volunteers) || 0,
        victimsCount: Number(form.victims) || 0,
        medicalStaffCount: Number(form.medicalStaff) || 0,
        contact: form.contact,
        description: form.description,
        // Wilayah disimpan semua (code + name)
        province: { code: form.provinceCode, name: form.provinceName },
        regency: { code: form.regencyCode, name: form.regencyName },
        district: { code: form.districtCode, name: form.districtName },
        village: { code: form.villageCode, name: form.villageName },
      }),
    });

    onClose();
    refetch();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 text-black overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[96vh] overflow-y-auto">
        <div className="bg-linear-to-r from-red-600 to-orange-600 text-white p-7 rounded-t-3xl text-center">
          <AlertTriangle className="w-12 h-12 mx-auto mb-3" />
          <h2 className="text-2xl font-bold">Laporkan Posko Bencana</h2>
          <p className="text-sm opacity-90 mt-2">
            Data langsung muncul di peta semua relawan
          </p>
        </div>

        <form onSubmit={submit} className="p-6 space-y-6">
          <div
            className={`flex items-center gap-4 p-5 rounded-2xl font-medium ${
              locating
                ? "bg-yellow-50 text-yellow-800"
                : form.lat
                ? "bg-green-50 text-green-800"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {locating ? (
              <Loader2 className="w-8 h-8 animate-spin" />
            ) : (
              <MapPin className="w-8 h-8" />
            )}
            <div>
              <div className="font-bold">
                {form.lat
                  ? "Lokasi berhasil didapat!"
                  : "Lokasi belum tersedia"}
              </div>
              {form.lat && (
                <div className="text-sm mt-1">
                  {form.lat}, {form.lng}
                </div>
              )}
            </div>
          </div>

          {/* Jenis Bencana */}
          <select
            value={form.disasterType}
            onChange={(e) => setForm({ ...form, disasterType: e.target.value })}
            className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-2xl focus:border-red-500 outline-none"
            required
          >
            <option value="" disabled>
              Pilih Jenis Bencana
            </option>
            {disasterTypes.map((t) => (
              <option key={t} value={t.toLowerCase().replace(/ /g, "_")}>
                {t}
              </option>
            ))}
          </select>

          {/* === BARU: Dropdown Wilayah === */}
          <div className="space-y-4">
            <p className="font-bold text-gray-800 text-lg">
              Lokasi Administratif
            </p>

            {/* Provinsi */}
            <div>
              <select
                value={form.provinceCode}
                onChange={(e) => {
                  const selected = provinces.find(
                    (p) => p.code === e.target.value
                  );
                  setForm({
                    ...form,
                    provinceCode: e.target.value,
                    provinceName: selected?.name || "",
                    regencyCode: "",
                    regencyName: "",
                    districtCode: "",
                    districtName: "",
                    villageCode: "",
                    villageName: "",
                  });
                }}
                className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-2xl focus:border-indigo-500 outline-none"
                disabled={loadingProv}
              >
                <option value="">
                  {loadingProv ? "Memuat provinsi..." : "Pilih Provinsi"}
                </option>
                {provinces.map((p) => (
                  <option key={p.code} value={p.code}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Kabupaten/Kota */}
            <div>
              <select
                value={form.regencyCode}
                onChange={(e) => {
                  const selected = regencies.find(
                    (r) => r.code === e.target.value
                  );
                  setForm({
                    ...form,
                    regencyCode: e.target.value,
                    regencyName: selected?.name || "",
                    districtCode: "",
                    districtName: "",
                    villageCode: "",
                    villageName: "",
                  });
                }}
                className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-2xl focus:border-indigo-500 outline-none"
                disabled={!form.provinceCode || loadingReg}
              >
                <option value="">
                  {loadingReg ? "Memuat kab/kota..." : "Pilih Kabupaten/Kota"}
                </option>
                {regencies.map((r) => (
                  <option key={r.code} value={r.code}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Kecamatan */}
            <div>
              <select
                value={form.districtCode}
                onChange={(e) => {
                  const selected = districts.find(
                    (d) => d.code === e.target.value
                  );
                  setForm({
                    ...form,
                    districtCode: e.target.value,
                    districtName: selected?.name || "",
                    villageCode: "",
                    villageName: "",
                  });
                }}
                className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-2xl focus:border-indigo-500 outline-none"
                disabled={!form.regencyCode || loadingDist}
              >
                <option value="">
                  {loadingDist ? "Memuat kecamatan..." : "Pilih Kecamatan"}
                </option>
                {districts.map((d) => (
                  <option key={d.code} value={d.code}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Desa/Kelurahan */}
            <div>
              <select
                value={form.villageCode}
                onChange={(e) => {
                  const selected = villages.find(
                    (v) => v.code === e.target.value
                  );
                  setForm({
                    ...form,
                    villageCode: e.target.value,
                    villageName: selected?.name || "",
                  });
                }}
                className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-2xl focus:border-indigo-500 outline-none"
                disabled={!form.districtCode || loadingVill}
              >
                <option value="">
                  {loadingVill
                    ? "Memuat desa/kelurahan..."
                    : "Pilih Desa/Kelurahan"}
                </option>
                {villages.map((v) => (
                  <option key={v.code} value={v.code}>
                    {v.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <input
            type="text"
            placeholder="Nama Posko / Titik Kumpul"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-2xl focus:border-orange-500 outline-none transition"
          />

          <input
            type="text"
            placeholder="Mitra / Kolaborator Posko (opsional, pisah koma)"
            value={form.partner}
            onChange={(e) => setForm({ ...form, partner: e.target.value })}
            className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-2xl focus:border-orange-500 outline-none transition"
          />

          {/* Jenis Posko */}
          <div>
            <p className="font-bold text-gray-800 mb-4 text-lg">Jenis Posko</p>
            <div className="grid grid-cols-2 gap-3">
              {jenisPoskoList.map((item) => (
                <label
                  key={item}
                  className="flex items-center gap-3 p-4 bg-orange-50 rounded-xl hover:bg-orange-100 cursor-pointer transition capitalize"
                >
                  <input
                    type="checkbox"
                    checked={form.poskoTypes.includes(item)}
                    onChange={() => togglePoskoType(item)}
                    className="w-6 h-6 text-orange-600 rounded focus:ring-orange-400"
                  />
                  <span className="font-medium">
                    {item.charAt(0).toUpperCase() + item.slice(1)}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-5 bg-blue-50 rounded-2xl">
              <Users className="w-10 h-10 mx-auto text-blue-600 mb-2" />
              <input
                type="number"
                placeholder="0"
                value={form.volunteers}
                onChange={(e) =>
                  setForm({ ...form, volunteers: e.target.value })
                }
                className="w-full text-3xl font-bold bg-transparent text-center outline-none"
              />
              <p className="text-sm text-gray-600 mt-1">Relawan</p>
            </div>
            <div className="text-center p-5 bg-red-50 rounded-2xl">
              <Heart className="w-10 h-10 mx-auto text-red-600 mb-2" />
              <input
                type="number"
                placeholder="0"
                value={form.victims}
                onChange={(e) => setForm({ ...form, victims: e.target.value })}
                className="w-full text-3xl font-bold bg-transparent text-center outline-none"
              />
              <p className="text-sm text-gray-600 mt-1">Pengungsi</p>
            </div>
            <div className="text-center p-5 bg-purple-50 rounded-2xl">
              <Stethoscope className="w-10 h-10 mx-auto text-purple-600 mb-2" />
              <input
                type="number"
                placeholder="0"
                value={form.medicalStaff}
                onChange={(e) =>
                  setForm({ ...form, medicalStaff: e.target.value })
                }
                className="w-full text-3xl font-bold bg-transparent text-center outline-none"
              />
              <p className="text-sm text-gray-600 mt-1">Tenaga Kesehatan</p>
            </div>
          </div>

          <input
            type="text"
            placeholder="PIC (Penanggung Jawab)"
            value={form.pic}
            onChange={(e) => setForm({ ...form, pic: e.target.value })}
            className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-2xl focus:border-orange-500 outline-none transition"
          />

          <div className="flex items-center gap-4 p-5 bg-green-50 rounded-2xl">
            <Phone className="w-8 h-8 text-green-600" />
            <input
              type="text"
              placeholder="Nomor WA / Telepon"
              value={form.contact}
              onChange={(e) => setForm({ ...form, contact: e.target.value })}
              className="flex-1 text-lg bg-transparent outline-none"
            />
          </div>

          {/* Koordinat */}
          <div className="grid grid-cols-2 gap-4">
            <input
              value={form.lat}
              readOnly
              placeholder="Latitude"
              className="px-6 py-4 bg-gray-100 rounded-2xl text-center font-mono"
            />
            <input
              value={form.lng}
              readOnly
              placeholder="Longitude"
              className="px-6 py-4 bg-gray-100 rounded-2xl text-center font-mono"
            />
          </div>

          {/* Kebutuhan Mendesak */}
          <div>
            <p className="font-bold text-gray-800 mb-4 text-lg">
              Kebutuhan Mendesak
            </p>
            <div className="grid grid-cols-2 gap-3">
              {needsList.map((item) => (
                <label
                  key={item}
                  className="flex items-center gap-3 p-4 bg-orange-50 rounded-xl hover:bg-orange-100 cursor-pointer transition"
                >
                  <input
                    type="checkbox"
                    checked={form.urgentNeeds.includes(item)}
                    onChange={() => toggleNeed(item)}
                    className="w-6 h-6 text-orange-600 rounded focus:ring-orange-400"
                  />
                  <span className="font-medium">{item}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Deskripsi */}
          <textarea
            placeholder="Alamat lengkap atau keterangan penting..."
            rows={4}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-2xl focus:border-green-500 outline-none resize-none"
          />

          {/* Tombol */}
          <div className="flex gap-4 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-5 border-2 border-gray-400 rounded-2xl font-bold text-gray-700 hover:bg-gray-100 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 py-5 bg-blue-600 text-white text-xl font-bold rounded-2xl shadow-xl hover:bg-blue-700 transition"
            >
              Laporkan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
