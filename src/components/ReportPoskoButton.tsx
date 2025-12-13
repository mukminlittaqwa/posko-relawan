import { Plus } from "lucide-react";

interface Props {
  onClick: () => void;
}

export default function ReportPoskoButton({ onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-8 right-3 z-8888 w-14 h-14 rounded-full bg-green-500 text-white shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300"
    >
      <Plus className="w-8 h-8" strokeWidth={3} />
    </button>
  );
}
