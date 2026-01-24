export function RevenueChart({ data }) {
  const max = Math.max(...data.map(d => d.value), 1);

  return (
    <div className="h-48 flex items-end gap-3 p-4 border rounded-lg bg-gray-50">
      {data.map(item => (
        <div key={item.date} className="flex flex-col items-center gap-1">
          <div
            className="w-8 bg-purple-500 rounded-t-md"
            style={{ height: `${(item.value / max) * 100}%` }}
          />
          <div className="text-[10px] text-gray-500">
            {item.date.slice(5)}
          </div>
        </div>
      ))}
    </div>
  );
}
