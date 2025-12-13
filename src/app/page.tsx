// "use client";

// import { useEffect, useState } from "react";
// import MapComponent from "@/components/MapComponent";
// import {
//   MapPin,
//   Users,
//   Heart,
//   Phone,
//   AlertTriangle,
//   Loader2,
//   Plus,
// } from "lucide-react";

// interface Posko {
//   _id: string;
//   name: string;
//   lat: number;
//   lng: number;
//   disasterType: string;
//   urgentNeeds: string[];
//   volunteersCount: number;
//   victims: number;
//   contact: string;
//   description: string;
// }

// const disasterTypes = [
//   "Banjir",
//   "Gempa Bumi",
//   "Longsor",
//   "Tsunami",
//   "Gunung Api",
//   "Kebakaran Hutan",
//   "Lainnya",
// ];
// const needsList = [
//   "Makanan",
//   "Air Bersih",
//   "Obat",
//   "Selimut",
//   "Tenda",
//   "Pakaian",
//   "Pembalut",
//   "Susu Bayi",
//   "Popok",
//   "Alat Mandi",
// ];

// export default function Home() {
//   const [poskos, setPoskos] = useState<Posko[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [open, setOpen] = useState(false);
//   const [locating, setLocating] = useState(false);

//   const [form, setForm] = useState({
//     name: "",
//     lat: "",
//     lng: "",
//     disasterType: "banjir",
//     urgentNeeds: [] as string[],
//     volunteers: "",
//     victims: "",
//     contact: "",
//     description: "",
//   });

//   useEffect(() => {
//     fetch("/api/poskos")
//       .then((r) => r.json())
//       .then((d) => d.success && setPoskos(d.data));
//     setLoading(false);
//   }, []);

//   const openFormAndGetLocation = () => {
//     if (!navigator.geolocation) {
//       alert("Browser tidak mendukung GPS. Isi koordinat manual ya.");
//       setOpen(true);
//       return;
//     }

//     setLocating(true);
//     setOpen(true);

//     navigator.geolocation.getCurrentPosition(
//       (pos) => {
//         const lat = pos.coords.latitude.toFixed(6);
//         const lng = pos.coords.longitude.toFixed(6);

//         setForm((f) => ({
//           ...f,
//           lat,
//           lng,
//         }));

//         setLocating(false);
//       },
//       (error) => {
//         console.error("Geolocation error:", error);
//         let message = "Gagal ambil lokasi.";

//         if (error.code === 1) message = "Izin lokasi ditolak.";
//         if (error.code === 2) message = "Lokasi tidak tersedia.";
//         if (error.code === 3) message = "Timeout mengambil lokasi.";

//         alert(message + " Silakan isi koordinat manual.");
//         setLocating(false);
//       },
//       {
//         enableHighAccuracy: true,
//         timeout: 15000,
//         maximumAge: 0,
//       }
//     );
//   };

//   const toggleNeed = (item: string) => {
//     setForm((f) => ({
//       ...f,
//       urgentNeeds: f.urgentNeeds.includes(item)
//         ? f.urgentNeeds.filter((i) => i !== item)
//         : [...f.urgentNeeds, item],
//     }));
//   };

//   const submit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!form.name || !form.lat || !form.lng) {
//       alert("Nama posko dan lokasi wajib diisi!");
//       return;
//     }

//     await fetch("/api/poskos", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         ...form,
//         lat: parseFloat(form.lat),
//         lng: parseFloat(form.lng),
//         volunteersCount: Number(form.volunteers) || 0,
//         victimsCount: Number(form.victims) || 0,
//       }),
//     });

//     setOpen(false);
//     setForm({
//       name: "",
//       lat: "",
//       lng: "",
//       disasterType: "banjir",
//       urgentNeeds: [],
//       volunteers: "",
//       victims: "",
//       contact: "",
//       description: "",
//     });

//     const res = await fetch("/api/poskos");
//     const json = await res.json();
//     if (json.success) setPoskos(json.data);
//   };

//   return (
//     <>
//       {loading ? (
//         <div className="h-screen flex items-center justify-center bg-linear-to-br from-red-50 to-orange-50">
//           <Loader2 className="w-16 h-16 animate-spin text-red-600" />
//         </div>
//       ) : (
//         <MapComponent poskos={poskos} onMapClick={() => {}} />
//       )}

//       <button
//         onClick={openFormAndGetLocation}
//         className="fixed bottom-8 right-8 z-9999 w-10 h-10 rounded-full bg-linear-to-br from-red-600 to-orange-600 text-white shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300"
//       >
//         <Plus className="w-12 h-12 mx-auto" strokeWidth={3} />
//       </button>

//       {open && (
//         <div className="fixed inset-0 z-9999 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 text-black">
//           <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[96vh] overflow-y-auto">
//             <div className="bg-linear-to-r from-red-600 to-orange-600 text-white p-7 rounded-t-3xl text-center">
//               <AlertTriangle className="w-12 h-12 mx-auto mb-3" />
//               <h2 className="text-2xl font-bold">Laporkan Posko Bencana</h2>
//               <p className="text-sm opacity-90 mt-2">
//                 Data langsung muncul di peta semua relawan
//               </p>
//             </div>

//             <form onSubmit={submit} className="p-6 space-y-6">
//               <div
//                 className={`flex items-center gap-4 p-5 rounded-2xl font-medium ${
//                   locating
//                     ? "bg-yellow-50 text-yellow-800"
//                     : form.lat
//                     ? "bg-green-50 text-green-800"
//                     : "bg-gray-100 text-gray-600"
//                 }`}
//               >
//                 {locating ? (
//                   <Loader2 className="w-8 h-8 animate-spin" />
//                 ) : (
//                   <MapPin className="w-8 h-8" />
//                 )}
//                 <div>
//                   <div className="font-bold">
//                     {form.lat
//                       ? "Lokasi berhasil didapat!"
//                       : "Lokasi belum tersedia"}
//                   </div>
//                   {form.lat && (
//                     <div className="text-sm mt-1">
//                       {form.lat}, {form.lng}
//                     </div>
//                   )}
//                 </div>
//               </div>

//               <input
//                 type="text"
//                 placeholder="Nama Posko / Titik Kumpul"
//                 value={form.name}
//                 onChange={(e) => setForm({ ...form, name: e.target.value })}
//                 required
//                 className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-2xl focus:border-orange-500 outline-none transition"
//               />

//               <div className="grid grid-cols-2 gap-4">
//                 <input
//                   value={form.lat}
//                   readOnly
//                   placeholder="Latitude"
//                   className="px-6 py-4 bg-gray-100 rounded-2xl text-center font-mono"
//                 />
//                 <input
//                   value={form.lng}
//                   readOnly
//                   placeholder="Longitude"
//                   className="px-6 py-4 bg-gray-100 rounded-2xl text-center font-mono"
//                 />
//               </div>

//               <select
//                 value={form.disasterType}
//                 onChange={(e) =>
//                   setForm({ ...form, disasterType: e.target.value })
//                 }
//                 className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-2xl focus:border-red-500 outline-none"
//               >
//                 {disasterTypes.map((t) => (
//                   <option key={t} value={t.toLowerCase().replace(/ /g, "_")}>
//                     {t}
//                   </option>
//                 ))}
//               </select>

//               <div>
//                 <p className="font-bold text-gray-800 mb-4 text-lg">
//                   Kebutuhan Mendesak
//                 </p>
//                 <div className="grid grid-cols-2 gap-3">
//                   {needsList.map((item) => (
//                     <label
//                       key={item}
//                       className="flex items-center gap-3 p-4 bg-orange-50 rounded-xl hover:bg-orange-100 cursor-pointer transition"
//                     >
//                       <input
//                         type="checkbox"
//                         checked={form.urgentNeeds.includes(item)}
//                         onChange={() => toggleNeed(item)}
//                         className="w-6 h-6 text-orange-600 rounded focus:ring-orange-400"
//                       />
//                       <span className="font-medium">{item}</span>
//                     </label>
//                   ))}
//                 </div>
//               </div>

//               <div className="grid grid-cols-2 gap-5">
//                 <div className="text-center p-5 bg-blue-50 rounded-2xl">
//                   <Users className="w-10 h-10 mx-auto text-blue-600 mb-2" />
//                   <input
//                     type="number"
//                     placeholder="0"
//                     value={form.volunteers}
//                     onChange={(e) =>
//                       setForm({ ...form, volunteers: e.target.value })
//                     }
//                     className="w-full text-3xl font-bold bg-transparent text-center outline-none"
//                   />
//                   <p className="text-sm text-gray-600 mt-1">Relawan</p>
//                 </div>
//                 <div className="text-center p-5 bg-red-50 rounded-2xl">
//                   <Heart className="w-10 h-10 mx-auto text-red-600 mb-2" />
//                   <input
//                     type="number"
//                     placeholder="0"
//                     value={form.victims}
//                     onChange={(e) =>
//                       setForm({ ...form, victims: e.target.value })
//                     }
//                     className="w-full text-3xl font-bold bg-transparent text-center outline-none"
//                   />
//                   <p className="text-sm text-gray-600 mt-1">Pengungsi</p>
//                 </div>
//               </div>

//               <div className="flex items-center gap-4 p-5 bg-green-50 rounded-2xl">
//                 <Phone className="w-8 h-8 text-green-600" />
//                 <input
//                   type="text"
//                   placeholder="Nomor WA / Telepon"
//                   value={form.contact}
//                   onChange={(e) =>
//                     setForm({ ...form, contact: e.target.value })
//                   }
//                   className="flex-1 text-lg bg-transparent outline-none"
//                 />
//               </div>

//               <textarea
//                 placeholder="Alamat lengkap atau keterangan penting..."
//                 rows={4}
//                 value={form.description}
//                 onChange={(e) =>
//                   setForm({ ...form, description: e.target.value })
//                 }
//                 className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-2xl focus:border-green-500 outline-none resize-none"
//               />

//               <div className="flex gap-4 pt-6">
//                 <button
//                   type="button"
//                   onClick={() => setOpen(false)}
//                   className="flex-1 py-5 border-2 border-gray-400 rounded-2xl font-bold text-gray-700 hover:bg-gray-100 transition"
//                 >
//                   Batal
//                 </button>
//                 <button
//                   type="submit"
//                   className="flex-1 py-5 bg-linear-to-r from-red-600 to-orange-600 text-white text-xl font-bold rounded-2xl shadow-xl hover:shadow-2xl transition"
//                 >
//                   Laporkan Sekarang
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }

"use client";

import MapComponent from "@/components/MapComponent";
import ReportPoskoButton from "@/components/ReportPoskoButton";
import ReportPoskoModal from "@/components/ReportPoskoModal";
import { Loader2 } from "lucide-react";
import { usePoskos } from "@/hooks/usePoskos";
import { useState } from "react";

export default function Home() {
  const { poskos, loading } = usePoskos();
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
      <ReportPoskoModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
