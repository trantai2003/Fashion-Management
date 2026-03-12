export default function Stat({ icon, label, value }) {
  return (
    <div className="bg-white border-0 shadow-md rounded-xl p-4">
      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-500">{label}</div>
        {icon}
      </div>

      <div className="mt-2 text-2xl font-bold text-gray-900">
        {value}
      </div>
    </div>
  );
}