import { PERMISSION_GROUPS } from "@/constants/backend/permission-groups";

export default function PermissionMatrix({ form, setForm }) {
  const toggle = (key) => {
    setForm((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [key]: !prev.permissions[key],
      },
    }));
  };

  return (
    <div className="space-y-6">
      {PERMISSION_GROUPS.map((group) => (
        <div key={group.groupKey} className="border p-4 rounded">
          <p className="font-semibold mb-3">
            {group.groupLabel}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {group.permissions.map((p) => (
              <label key={p.key} className="flex gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={!!form.permissions[p.key]}
                  onChange={() => toggle(p.key)}
                />
                {p.label}
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
