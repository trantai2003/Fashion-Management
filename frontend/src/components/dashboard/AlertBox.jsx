export default function AlertBox({ title, subtitle, color }) {

  const colorMap = {
    red: "bg-red-50 border-red-200 text-red-700",
    yellow: "bg-yellow-50 border-yellow-200 text-yellow-700",
    gray: "bg-gray-50 border-gray-200 text-gray-800",
  };

  return (
    <div className={`p-3 rounded-lg border ${colorMap[color]}`}>
      <div className="text-sm font-semibold">{title}</div>
      <div className="text-xs mt-1">{subtitle}</div>
    </div>
  );

}