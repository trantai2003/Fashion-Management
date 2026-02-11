import { quyenHanService } from "@/services/quyenHan";
import { useEffect, useState } from "react";

/**
 * PermissionMatrix
 * - Hiển thị toàn bộ quyền từ API, group theo `nhomQuyen`
 * - Điều khiển bằng props: selectedPermissions (map id -> boolean)
 */
export default function PermissionMatrix({
  selectedPermissions,
  setSelectedPermissions,
}) {
  const [quyenHan, setQuyenHan] = useState([]);

  useEffect(() => {
    const fetchQuyenHan = async () => {
      const res = await quyenHanService.getAllQuyenHan();
      setQuyenHan(res.data.data || []);
    };
    fetchQuyenHan();
  }, []);

  const toggle = (id) => {
    setSelectedPermissions((prev) => ({
      ...prev,
      [id]: !prev?.[id],
    }));
  };

  const grouped = quyenHan.reduce((groups, item) => {
    const groupKey = item.nhomQuyen || "khac";
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(item);
    return groups;
  }, {});

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([groupKey, permissions]) => (
        <div key={groupKey} className="border p-4 rounded">
          <p className="font-semibold mb-3">{groupKey.toUpperCase()}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {permissions.map((p) => (
              <label key={p.id} className="flex gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={!!selectedPermissions?.[p.id]}
                  onChange={() => toggle(p.id)}
                />
                {p.tenQuyen}
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

