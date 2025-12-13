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

const kondisiAkses = ["akses_lancar", "akses_terbatas", "terisolir"];

const jenisPoskoList = ["logistik", "kesehatan", "dapur umum", "shelter"];

interface Wilayah {
  code: string;
  name: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ReportPoskoModal({ open, onClose, onSuccess }: Props) {
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
    accessLocation: "",
    refugeesTotal: "", // Jumlah jiwa pengungsi
    refugeesKK: "", // Jumlah Kepala Keluarga
    refugeesMale: "", // Laki-laki
    refugeesFemale: "", // Perempuan
    refugeesBaby: "", // Bayi (0-5 tahun)
    refugeesChild: "", // Anak & Remaja (6-17 tahun)
    refugeesAdult: "", // Dewasa (18-59 tahun)
    refugeesElderly: "", // Lansia (60+ tahun)
  });

  const [provinces, setProvinces] = useState<Wilayah[]>([]);
  const [regencies, setRegencies] = useState<Wilayah[]>([]);
  const [districts, setDistricts] = useState<Wilayah[]>([]);
  const [villages, setVillages] = useState<Wilayah[]>([]);

  const [loadingProv, setLoadingProv] = useState(true);
  const [loadingReg, setLoadingReg] = useState(false);
  const [loadingDist, setLoadingDist] = useState(false);
  const [loadingVill, setLoadingVill] = useState(false);

  const [photoUrls, setPhotoUrls] = useState<string[]>([]);

  const openCloudinaryWidget = () => {
    if (!(window as any).cloudinary) {
      const script = document.createElement("script");
      script.src = "https://widget.cloudinary.com/v2.0/global/all.js";
      script.async = true;
      script.onload = () => initWidget();
      document.body.appendChild(script);
    } else {
      initWidget();
    }

    function initWidget() {
      (window as any).cloudinary
        .createUploadWidget(
          {
            cloudName: "dgqlwjwot",
            uploadPreset: "posko_relawan_unsigned",
            multiple: true,
            maxFiles: 6,
            cropping: false,
            folder: "posko-bencana",
            clientAllowedFormats: ["jpg", "jpeg", "png", "webp"],
            maxImageFileSize: 5000000,
            styles: {
              palette: {
                window: "#FFFFFF",
                windowBorder: "#FF5A5F",
                tabIcon: "#FF5A5F",
                activeTabIcon: "#FF2600",
                inactiveTabIcon: "#AAAAAA",
                link: "#FF5A5F",
                action: "#FF5A5F",
                inProgress: "#FFD700",
                complete: "#4CAF50",
                error: "#F44336",
                sourceBg: "#F5F5F5",
              },
              fonts: {
                default: null,
                "Roboto, sans-serif": {
                  url: "https://fonts.googleapis.com/css?family=Roboto",
                  active: true,
                },
              },
            },
          },
          (error: any, result: any) => {
            if (!error && result && result.event === "success") {
              setPhotoUrls((prev) => [...prev, result.info.secure_url]);
            }
          }
        )
        .open();
    }
  };

  const removePhoto = (index: number) => {
    setPhotoUrls((prev) => prev.filter((_, i) => i !== index));
  };

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
        accessLocation: "",
        refugeesTotal: "", // Jumlah jiwa pengungsi
        refugeesKK: "", // Jumlah Kepala Keluarga
        refugeesMale: "", // Laki-laki
        refugeesFemale: "", // Perempuan
        refugeesBaby: "", // Bayi (0-5 tahun)
        refugeesChild: "", // Anak & Remaja (6-17 tahun)
        refugeesAdult: "", // Dewasa (18-59 tahun)
        refugeesElderly: "",
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

    try {
      const res = await fetch("/api/poskos", {
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
          province: { code: form.provinceCode, name: form.provinceName },
          regency: { code: form.regencyCode, name: form.regencyName },
          district: { code: form.districtCode, name: form.districtName },
          village: { code: form.villageCode, name: form.villageName },
          photoUrls: photoUrls,
          accessLocation: form.accessLocation,
          refugeesTotal: Number(form.refugeesTotal) || 0,
          refugeesKK: Number(form.refugeesKK) || 0,
          refugeesMale: Number(form.refugeesMale) || 0,
          refugeesFemale: Number(form.refugeesFemale) || 0,
          refugeesBaby: Number(form.refugeesBaby) || 0,
          refugeesChild: Number(form.refugeesChild) || 0,
          refugeesAdult: Number(form.refugeesAdult) || 0,
          refugeesElderly: Number(form.refugeesElderly) || 0,
        }),
      });

      if (res.ok) {
        alert("Posko berhasil dilaporkan!");
        onClose();
        setPhotoUrls([]);
        onSuccess?.();
        refetch();
      } else {
        const error = await res.json();
        alert("Gagal menyimpan: " + (error.message || "Server error"));
      }
    } catch (err) {
      console.error(err);
      alert("Gagal mengirim data. Cek koneksi internet.");
    }
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

          <div className="space-y-4">
            <p className="font-bold text-gray-800 text-lg">
              Lokasi Administratif
            </p>

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

          <div className="space-y-2">
            <label className="block font-bold text-gray-800 text-lg pl-1">
              Kondisi Akses lokasi
            </label>
            <select
              value={form.accessLocation}
              onChange={(e) =>
                setForm({ ...form, accessLocation: e.target.value })
              }
              className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-2xl focus:border-red-500 outline-none transition-shadow focus:ring-4 focus:ring-red-200"
              required
              aria-label="Pilih jenis bencana"
            >
              <option value="" disabled>
                Pilih keterangan akses lokasi
              </option>
              {kondisiAkses.map((t) => (
                <option key={t} value={t.toLowerCase().replace(/ /g, "_")}>
                  {t}
                </option>
              ))}
            </select>
          </div>

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

          <div className="grid grid-cols-2 gap-4">
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
            {/* <div className="text-center p-5 bg-red-50 rounded-2xl">
              <Heart className="w-10 h-10 mx-auto text-red-600 mb-2" />
              <input
                type="number"
                placeholder="0"
                value={form.victims}
                onChange={(e) => setForm({ ...form, victims: e.target.value })}
                className="w-full text-3xl font-bold bg-transparent text-center outline-none"
              />
              <p className="text-sm text-gray-600 mt-1">Pengungsi</p>
            </div> */}
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

          {/* Data Pengungsian */}
          <div className="space-y-6">
            <p className="font-bold text-gray-800 text-xl text-center bg-gradient-to-r from-red-100 to-orange-100 py-3 rounded-2xl">
              Data Pengungsian
            </p>

            {/* Jumlah Jiwa & KK */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jumlah Jiwa Pengungsi
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  placeholder="0"
                  value={form.refugeesTotal}
                  onChange={(e) =>
                    setForm({ ...form, refugeesTotal: e.target.value })
                  }
                  className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-2xl focus:border-red-500 outline-none transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jumlah (KK)
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  placeholder="0"
                  value={form.refugeesKK}
                  onChange={(e) =>
                    setForm({ ...form, refugeesKK: e.target.value })
                  }
                  className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-2xl focus:border-red-500 outline-none transition"
                />
              </div>
            </div>

            {/* Jenis Kelamin */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-3">
                Berdasarkan Jenis Kelamin
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-2xl p-4 text-center">
                  <p className="text-sm text-blue-700 font-medium mb-2">
                    Laki-laki
                  </p>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={form.refugeesMale}
                    onChange={(e) =>
                      setForm({ ...form, refugeesMale: e.target.value })
                    }
                    className="w-full text-2xl font-bold text-blue-800 bg-transparent text-center outline-none"
                  />
                </div>
                <div className="bg-pink-50 rounded-2xl p-4 text-center">
                  <p className="text-sm text-pink-700 font-medium mb-2">
                    Perempuan
                  </p>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={form.refugeesFemale}
                    onChange={(e) =>
                      setForm({ ...form, refugeesFemale: e.target.value })
                    }
                    className="w-full text-2xl font-bold text-pink-800 bg-transparent text-center outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Berdasarkan Usia */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-3">
                Berdasarkan Kelompok Usia
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-yellow-50 rounded-2xl p-4 text-center">
                  <p className="text-sm text-yellow-700 font-medium mb-2">
                    Bayi (0-5 th)
                  </p>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={form.refugeesBaby}
                    onChange={(e) =>
                      setForm({ ...form, refugeesBaby: e.target.value })
                    }
                    className="w-full text-2xl font-bold text-yellow-800 bg-transparent text-center outline-none"
                  />
                </div>
                <div className="bg-green-50 rounded-2xl p-4 text-center">
                  <p className="text-sm text-green-700 font-medium mb-2">
                    Anak & Remaja (6-17 th)
                  </p>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={form.refugeesChild}
                    onChange={(e) =>
                      setForm({ ...form, refugeesChild: e.target.value })
                    }
                    className="w-full text-2xl font-bold text-green-800 bg-transparent text-center outline-none"
                  />
                </div>
                <div className="bg-indigo-50 rounded-2xl p-4 text-center">
                  <p className="text-sm text-indigo-700 font-medium mb-2">
                    Dewasa (18-59 th)
                  </p>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={form.refugeesAdult}
                    onChange={(e) =>
                      setForm({ ...form, refugeesAdult: e.target.value })
                    }
                    className="w-full text-2xl font-bold text-indigo-800 bg-transparent text-center outline-none"
                  />
                </div>
                <div className="bg-gray-100 rounded-2xl p-4 text-center">
                  <p className="text-sm text-gray-700 font-medium mb-2">
                    Lansia (60+ th)
                  </p>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={form.refugeesElderly}
                    onChange={(e) =>
                      setForm({ ...form, refugeesElderly: e.target.value })
                    }
                    className="w-full text-2xl font-bold text-gray-800 bg-transparent text-center outline-none"
                  />
                </div>
              </div>
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

          <textarea
            placeholder="Alamat lengkap atau keterangan penting..."
            rows={4}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-2xl focus:border-green-500 outline-none resize-none"
          />

          <div className="space-y-4">
            <p className="font-bold text-gray-800 text-lg">
              Foto Posko (Opsional, maks 6)
            </p>

            <button
              type="button"
              onClick={openCloudinaryWidget}
              className="w-full py-6 border-3 border-dashed border-orange-500 rounded-2xl bg-orange-50 hover:bg-orange-100 transition flex flex-col items-center justify-center gap-3 text-orange-700 font-bold"
            >
              <svg
                className="w-12 h-12"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <span className="text-lg">Klik untuk Upload Foto</span>
              <span className="text-sm font-normal">
                JPG, PNG, WebP • Maks 5MB
              </span>
            </button>

            {photoUrls.length > 0 && (
              <div>
                <p className="text-sm text-gray-600 mb-3">
                  Foto terupload ({photoUrls.length}/6):
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {photoUrls.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Foto posko ${index + 1}`}
                        className="w-full h-48 object-cover rounded-xl shadow-md"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute top-2 right-2 bg-red-600 text-white w-8 h-8 rounded-full opacity-0 group-hover:opacity-100 transition flex items-center justify-center font-bold text-xl shadow-lg"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

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
