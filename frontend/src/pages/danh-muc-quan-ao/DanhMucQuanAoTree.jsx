import React, { useState, useEffect } from 'react';
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  GripVertical,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  AlertTriangle,
  Tag,
  Layers,
  RefreshCcw,
} from 'lucide-react';
import { danhMucQuanAoService } from '@/services/danhMucQuanAoService';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Màn hình quản lý danh mục quần áo dạng cây – hỗ trợ thêm/sửa/xóa/khoá/kéo-thả đổi cha-con
const DanhMucQuanAoTree = () => {

  // ── STATE ──────────────────────────────────────────────────────────────────
  const [treeData, setTreeData] = useState([]);                              // dữ liệu cây danh mục, nguồn chính render UI
  const [expandedNodes, setExpandedNodes] = useState(new Set());            // tập id các node đang mở (Set → O(1) lookup)
  const [draggedNode, setDraggedNode] = useState(null);                     // node đang được kéo
  const [dragOverNode, setDragOverNode] = useState(null);                   // node đang được hover khi kéo
  const [editingNode, setEditingNode] = useState(null);                     // id node đang ở chế độ sửa inline
  const [editForm, setEditForm] = useState({});                             // dữ liệu form sửa
  const [creatingNode, setCreatingNode] = useState(null);                   // 'root' hoặc id cha khi đang tạo mới
  const [createForm, setCreateForm] = useState({ maDanhMuc: '', tenDanhMuc: '', moTa: '', trangThai: 1 }); // dữ liệu form tạo mới
  const [deleteModal, setDeleteModal] = useState({ show: false, nodeId: null, nodeName: '' }); // trạng thái modal xác nhận xóa
  const [isLoading, setIsLoading] = useState(false);                        // cờ loading khi tải/reload dữ liệu

  // ── STATS ──────────────────────────────────────────────────────────────────
  const [stats, setStats] = useState({ total: 0, root: 0, sub: 0 });       // số liệu thống kê hiển thị dashboard card

  // Đếm tổng/gốc/con cho dashboard – chỉ tính node đang hoạt động (trangThai !== 0)
  const computeStats = (nodes) => {
    let total = 0, root = 0, sub = 0;
    const walk = (list, level) => {
      list.forEach((n) => {
        if (n.trangThai === 0) return; // bỏ qua node đã khoá
        total++;
        if (level === 0) root++; else sub++;
        if (n.danhMucCons?.length) walk(n.danhMucCons, level + 1);
      });
    };
    walk(nodes, 0);
    return { total, root, sub };
  };

  // Chuẩn hóa payload phẳng hoặc lồng nhau từ API thành cây cha-con đúng chuẩn cho UI
  const buildTreeFromAll = (list) => {
    if (!Array.isArray(list) || list.length === 0) return [];
    const rawById = new Map();    // id → node gốc từ API
    const parentById = new Map(); // id → parentId

    // Duyệt toàn bộ node, ghi nhận id và quan hệ cha (hỗ trợ cả payload phẳng lẫn lồng nhau)
    const visit = (nodes, inferredParentId = null) => {
      (nodes || []).forEach((item) => {
        if (!item || item.id == null) return;
        const explicitParentId = item.danhMucChaId ?? item.danhMucCha?.id ?? null;
        const parentId = explicitParentId ?? inferredParentId;
        if (!rawById.has(item.id)) rawById.set(item.id, item);
        if (parentId != null && parentId !== item.id) parentById.set(item.id, parentId);
        else if (!parentById.has(item.id)) parentById.set(item.id, null); // node gốc
        if (Array.isArray(item.danhMucCons) && item.danhMucCons.length > 0) visit(item.danhMucCons, item.id);
      });
    };
    visit(list, null);

    // Clone node, reset danhMucCons để lắp ráp lại từ đầu (tránh phụ thuộc cấu trúc payload gốc)
    const nodeMap = new Map();
    rawById.forEach((item, id) => nodeMap.set(id, { ...item, danhMucCons: [] }));

    // Gắn node vào cha tương ứng; node không có cha hợp lệ → roots[]
    const roots = [];
    nodeMap.forEach((node, id) => {
      const parentId = parentById.get(id);
      if (parentId != null && parentId !== id && nodeMap.has(parentId)) nodeMap.get(parentId).danhMucCons.push(node);
      else roots.push(node);
    });
    return roots;
  };

  // Thu thập tất cả id node hợp lệ – dùng để lọc expandedNodes sau reload (tránh id mồ côi)
  const collectNodeIds = (nodes) => {
    const ids = new Set();
    const walk = (list) => { (list || []).forEach((item) => { ids.add(item.id); if (item.danhMucCons?.length) walk(item.danhMucCons); }); };
    walk(nodes);
    return ids;
  };

  // Tải dữ liệu khi component mount lần đầu
  useEffect(() => { fetchTreeData(); }, []);

  // LUỒNG TẢI DỮ LIỆU: gọi song song getCayDanhMuc + getAll → ưu tiên getAll (đầy đủ hơn) → buildTreeFromAll → setTreeData
  const fetchTreeData = async () => {
    try {
      setIsLoading(true);
      // Gọi song song 2 API để giảm thời gian chờ
      const [treeResponse, allResponse] = await Promise.allSettled([
        danhMucQuanAoService.getCayDanhMuc(), // GET /get-cay-danh-muc – chỉ trả node đang hoạt động
        danhMucQuanAoService.getAll(),         // GET /all – trả toàn bộ kể cả trangThai=0
      ]);

      let data = [];

      // Ưu tiên getAll() vì đầy đủ cả node khoá
      if (allResponse.status === 'fulfilled' && allResponse.value?.data?.status === 200) {
        const allData = allResponse.value.data.data;
        if (Array.isArray(allData) && allData.length > 0) {
          data = buildTreeFromAll(allData);
        }
      }

      // Fallback sang getCayDanhMuc nếu getAll() lỗi hoặc không có dữ liệu
      if (data.length === 0 && treeResponse.status === 'fulfilled' && treeResponse.value?.data?.status === 200) {
        const treeDataRaw = treeResponse.value.data.data;
        if (Array.isArray(treeDataRaw) && treeDataRaw.length > 0) {
          data = buildTreeFromAll(treeDataRaw); // Sử dụng buildTreeFromAll cho nhất quán
        }
      }

      if (Array.isArray(data)) {
        setTreeData(data);
        setStats(computeStats(data));
        // Giữ lại các node đang mở hợp lệ sau reload (không đóng sập toàn bộ cây)
        setExpandedNodes((prev) => {
          const availableIds = collectNodeIds(data);
          const next = new Set();
          prev.forEach((id) => { if (availableIds.has(id)) next.add(id); });
          return next;
        });
      } else {
        // Cả 2 API đều không trả về dữ liệu hợp lệ
        setTreeData([]);
        setStats({ total: 0, root: 0, sub: 0 });
        toast.warning('Không có danh mục nào được tải');
      }
    } catch (error) {
      console.error('Lỗi khi tải danh mục:', error);
      toast.error('Không thể tải dữ liệu danh mục');
      setTreeData([]);
      setStats({ total: 0, root: 0, sub: 0 });
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle đóng/mở một node theo id
  const toggleExpand = (nodeId) => {
    setExpandedNodes((prev) => { const next = new Set(prev); if (next.has(nodeId)) next.delete(nodeId); else next.add(nodeId); return next; });
  };

  // ── DRAG & DROP ────────────────────────────────────────────────────────────

  // Bắt đầu kéo: lưu thông tin node đang kéo để dùng khi drop
  const handleDragStart = (e, node, parentId) => {
    e.stopPropagation();
    setDraggedNode({ ...node, currentParentId: parentId });
    e.dataTransfer.effectAllowed = 'move';
  };

  // Đang kéo qua node: highlight nếu hợp lệ (không phải chính nó, không phải con cháu)
  const handleDragOver = (e, node) => {
    e.preventDefault(); e.stopPropagation();
    if (draggedNode && draggedNode.id !== node.id && !isDescendant(draggedNode, node)) setDragOverNode(node.id);
  };

  // Rời vùng hover: xóa highlight
  const handleDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); setDragOverNode(null); };

  // LUỒNG KÉO-THẢ ĐỔI CHA: validate → Axios PUT update { danhMucChaId: targetNode.id } → Service.update → UPDATE DB → reload cây
  const handleDrop = async (e, targetNode) => {
    e.preventDefault(); e.stopPropagation(); setDragOverNode(null);
    if (!draggedNode || draggedNode.id === targetNode.id) { setDraggedNode(null); return; }
    if (isDescendant(draggedNode, targetNode)) {
      toast.warning('Không thể kéo danh mục cha vào con của nó'); // chặn vòng lặp cha-con
      setDraggedNode(null); return;
    }
    try {
      const response = await danhMucQuanAoService.update({
        id: draggedNode.id, tenDanhMuc: draggedNode.tenDanhMuc,
        danhMucChaId: targetNode.id, // gắn cha mới = node vừa thả vào
        moTa: draggedNode.moTa, trangThai: draggedNode.trangThai,
      });
      if (response.data.status === 200) { toast.success('Cập nhật thành công'); fetchTreeData(); }
      else toast.error('Cập nhật thất bại: ' + response.data.message);
    } catch { toast.error('Có lỗi xảy ra khi cập nhật'); }
    setDraggedNode(null);
  };

  // LUỒNG KÉO VỀ ROOT: Axios PUT update { danhMucChaId: null } → Service.update → UPDATE danh_muc_cha_id=NULL → reload
  const handleDropToRoot = async (e) => {
    e.preventDefault(); e.stopPropagation(); setDragOverNode(null);
    if (!draggedNode) return;
    try {
      const response = await danhMucQuanAoService.update({
        id: draggedNode.id, tenDanhMuc: draggedNode.tenDanhMuc,
        danhMucChaId: null, // null = chuyển về danh mục gốc
        moTa: draggedNode.moTa, trangThai: draggedNode.trangThai,
      });
      if (response.data.status === 200) { toast.success('Đã chuyển thành danh mục gốc!'); fetchTreeData(); }
      else toast.error('Cập nhật thất bại: ' + response.data.message);
    } catch { toast.error('Có lỗi xảy ra khi cập nhật'); }
    setDraggedNode(null);
  };

  // Kiểm tra targetNode có nằm trong nhánh con của sourceNode không (DFS – phòng cycle)
  const isDescendant = (sourceNode, targetNode) => {
    if (!sourceNode.danhMucCons?.length) return false;
    for (const child of sourceNode.danhMucCons) {
      if (child.id === targetNode.id) return true;
      if (isDescendant(child, targetNode)) return true;
    }
    return false;
  };

  // ── EDIT ───────────────────────────────────────────────────────────────────

  // Mở inline edit: nạp dữ liệu node hiện tại vào editForm
  const handleEdit = (node, parentId) => {
    setEditingNode(node.id);
    setEditForm({ id: node.id, tenDanhMuc: node.tenDanhMuc, moTa: node.moTa, trangThai: node.trangThai, danhMucChaId: parentId });
  };

  // LUỒNG LƯU SỬA: Axios PUT /update (editForm) → Controller → Service.update → Repository.save → UPDATE DB → reload cây
  const handleSaveEdit = async () => {
    try {
      const response = await danhMucQuanAoService.update(editForm);
      if (response.data.status === 200) { toast.success('Cập nhật thành công!'); setEditingNode(null); fetchTreeData(); }
      else toast.error('Cập nhật thất bại: ' + response.data.message);
    } catch { toast.error('Có lỗi xảy ra khi cập nhật'); }
  };

  // ── DELETE ─────────────────────────────────────────────────────────────────

  // Mở modal xác nhận xóa, lưu id và tên node cần xóa
  const confirmDelete = (node) => setDeleteModal({ show: true, nodeId: node.id, nodeName: node.tenDanhMuc });

  // LUỒNG XÓA MỀM: Axios DELETE /{id} → Controller set trangThai=0 → Repository.save → node vẫn ở DB nhưng hiển thị mờ
  const handleDelete = async () => {
    try {
      const response = await danhMucQuanAoService.delete(deleteModal.nodeId);
      if (response.data.status === 200) { toast.success(`Đã chuyển "${deleteModal.nodeName}" sang ngừng hoạt động`); fetchTreeData(); }
    } catch { toast.error('Lỗi khi xóa danh mục'); }
    finally { setDeleteModal({ show: false, nodeId: null, nodeName: '' }); }
  };

  // ── CREATE ─────────────────────────────────────────────────────────────────

  // Mở form tạo danh mục con ngay dưới parentNode và tự động expand node cha
  const handleAddChild = (parentNode) => {
    setCreatingNode(parentNode.id);
    setCreateForm({ maDanhMuc: '', tenDanhMuc: '', moTa: '', trangThai: 1, danhMucChaId: parentNode.id });
    const newExpanded = new Set(expandedNodes);
    newExpanded.add(parentNode.id);
    setExpandedNodes(newExpanded);
  };

  // LUỒNG TẠO MỚI: validate client → chuẩn hóa payload → Axios POST /create → Controller → Service.create → Repository.findByMaDanhMuc + save → INSERT DB → reload cây
  const handleSaveCreate = async () => {
    // Validate client-side: tránh gửi request thiếu trường bắt buộc lên server
    if (!createForm.tenDanhMuc.trim()) { toast.warning('Vui lòng nhập tên danh mục!'); return; }
    if (!createForm.maDanhMuc.trim()) { toast.warning('Vui lòng nhập mã danh mục!'); return; }
    try {
      // Chuẩn hóa payload: trim chuỗi, ép trangThai về Number, đảm bảo danhMucChaId gửi null cho danh mục gốc
      const payload = {
        ...createForm,
        maDanhMuc: createForm.maDanhMuc.trim(),
        tenDanhMuc: createForm.tenDanhMuc.trim(),
        moTa: createForm.moTa?.trim() || '',
        trangThai: Number(createForm.trangThai) || 1,
        danhMucChaId: Object.prototype.hasOwnProperty.call(createForm, 'danhMucChaId') ? createForm.danhMucChaId : null,
      };
      // Gọi API: Frontend → Controller.create → Service.create (@Transactional) → Repository → DB
      const response = await danhMucQuanAoService.create(payload);
      if (response.data.status === 200) {
        toast.success('Tạo danh mục thành công!');
        setCreatingNode(null);
        setCreateForm({ maDanhMuc: '', tenDanhMuc: '', moTa: '', trangThai: 1 }); // reset form sau khi tạo thành công
        fetchTreeData(); // reload cây để đồng bộ dữ liệu mới từ DB
      } else {
        toast.error('Tạo danh mục thất bại: ' + (response.data.message || 'Không rõ lỗi')); // hiển thị lỗi nghiệp vụ từ backend (VD: trùng mã)
      }
    } catch (error) {
      // Lấy message lỗi từ response body backend thay vì thông báo chung chung
      const message = error?.response?.data?.message || error?.message || 'Có lỗi xảy ra khi tạo danh mục';
      toast.error(message);
    }
  };

  // Huỷ tạo mới, reset form về mặc định
  const handleCancelCreate = () => { setCreatingNode(null); setCreateForm({ maDanhMuc: '', tenDanhMuc: '', moTa: '', trangThai: 1 }); };

  // Mở form tạo danh mục cấp gốc (danhMucChaId = null)
  const handleAddRoot = () => { setCreatingNode('root'); setCreateForm({ maDanhMuc: '', tenDanhMuc: '', moTa: '', trangThai: 1, danhMucChaId: null }); };

  // ── Render create form ────────────────────────────────────────────────────
  const renderCreateForm = (parentId) => (
      <div className={`my-2 ${parentId !== 'root' ? 'ml-5' : ''}`}>
        <div
            className="rounded-xl border border-[#b8860b]/30 bg-gradient-to-b from-[#fffaf0] to-[#f7f0df] p-4 shadow-sm"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          <p
              className="mb-3 text-sm font-semibold text-slate-500"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {parentId === 'root' ? 'Thêm danh mục gốc mới' : 'Thêm danh mục con'}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-[#7a6e5f]">Mã danh mục *</label>
              <Input
                  value={createForm.maDanhMuc}
                  onChange={(e) => setCreateForm({ ...createForm, maDanhMuc: e.target.value })}
                  placeholder="VD: DM001"
                  className="h-8 text-sm border-[#b8860b]/25 focus:border-[#b8860b] focus-visible:ring-[#b8860b]/30"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                  autoFocus
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-[#7a6e5f]">Tên danh mục *</label>
              <Input
                  value={createForm.tenDanhMuc}
                  onChange={(e) => setCreateForm({ ...createForm, tenDanhMuc: e.target.value })}
                  placeholder="VD: Áo thun"
                  className="h-8 text-sm border-[#b8860b]/25 focus:border-[#b8860b] focus-visible:ring-[#b8860b]/30"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
              />
            </div>
          </div>
          <div className="space-y-1 mb-3">
            <label className="text-xs font-medium text-[#7a6e5f]">Mô tả</label>
            <textarea
                value={createForm.moTa}
                onChange={(e) => setCreateForm({ ...createForm, moTa: e.target.value })}
                placeholder="Nhập mô tả..."
                rows={2}
                className="w-full rounded-md border border-[#b8860b]/25 bg-white px-3 py-2 text-sm outline-none focus:border-[#b8860b] resize-none"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
                size="sm"
                variant="outline"
                onClick={handleCancelCreate}
                className="h-8 gap-1.5 border-[#b8860b]/35 text-[#7a6e5f] hover:bg-[#f7edd3] hover:text-[#7a5700]"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              <X className="h-3.5 w-3.5" /> Hủy
            </Button>
            <Button
                size="sm"
                onClick={handleSaveCreate}
                className="h-8 gap-1.5 border border-[#b8860b]/20 bg-gradient-to-br from-[#d4a72b] to-[#b8860b] text-white hover:from-[#c79616] hover:to-[#a97700]"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              <Save className="h-3.5 w-3.5" /> Lưu
            </Button>
          </div>
        </div>
      </div>
  );

  // ── Render node ───────────────────────────────────────────────────────────
  /**
   * Render đệ quy từng node trong cây danh mục.
   * - level: độ sâu hiện tại → margin-left = level × 20px để thể hiện cấp bậc.
   * - parentId: id cha của node hiện tại (dùng cho edit).
   * - isInactive: node trangThai=0 hiển thị mờ.
   * - isEditing: render Input thay vì text thuần để sửa inline.
   * - isCreating: mở form tạo con ngay dưới node này khi đang expanded.
   * - Chỉ render con khi isExpanded = true → giảm số DOM node, cải thiện hiệu năng.
   */
  const renderNode = (node, level = 0, parentId = null) => {
    const allChildren = node.danhMucCons || [];
    const hasChildren = allChildren.length > 0;
    const isExpanded = expandedNodes.has(node.id);
    const isDragOver = dragOverNode === node.id;
    const isEditing = editingNode === node.id;
    const isCreating = creatingNode === node.id;
    const isInactive = Number(node.trangThai) === 0;


    return (
        <div key={node.id} style={{ marginLeft: level * 20 }}>
          {/* Moi cap trong cay se thut vao 20px de the hien quan he cap bac. */}
          <div
              draggable={!isEditing}
              onDragStart={(e) => handleDragStart(e, node, parentId)}
              onDragOver={(e) => handleDragOver(e, node)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, node)}
              className={`my-1 rounded-xl border transition-all duration-150
            ${isDragOver ? 'border-purple-400 bg-purple-50 shadow-md' : 'border-transparent'}
            ${isEditing ? 'border-purple-400 bg-purple-50/50' : ''}
          `}
          >
            {/* Node row */}
            <div className={`flex items-center justify-between px-3 py-2.5 rounded-xl bg-white shadow-sm border border-slate-200/80
            hover:border-purple-200 hover:shadow-md transition-all duration-150 cursor-move group
            ${isEditing ? 'border-purple-400 cursor-default' : ''}
            ${isInactive ? 'opacity-55 bg-slate-50 border-slate-200' : ''}
          `}>
              {/* Left */}
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <GripVertical className="h-4 w-4 text-gray-300 group-hover:text-gray-400 flex-shrink-0" />

                {(hasChildren || isCreating) ? (
                    <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleExpand(node.id);
                        }}
                        className="flex items-center justify-center h-5 w-5 rounded hover:bg-purple-100 text-gray-500 hover:text-purple-600 transition-colors flex-shrink-0"
                    >
                      {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                    </button>
                ) : (
                    <div className="w-5 flex-shrink-0" />
                )}

                {isExpanded && (hasChildren || isCreating)
                    ? <FolderOpen className="h-4 w-4 text-orange-400 flex-shrink-0" />
                    : <Folder className="h-4 w-4 text-orange-400 flex-shrink-0" />
                }

                {isEditing ? (
                    <Input
                        value={editForm.tenDanhMuc}
                        onChange={(e) => setEditForm({ ...editForm, tenDanhMuc: e.target.value })}
                        className="h-7 text-sm border-purple-300 focus:border-purple-500 min-w-0 flex-1"
                        autoFocus
                    />
                ) : (
                    <span className="font-semibold text-slate-800 text-sm truncate">{node.tenDanhMuc}</span>
                )}

                <span className="text-xs text-slate-400 font-mono flex-shrink-0">({node.maDanhMuc})</span>

                {level === 0 && (
                    <span className="ml-1 inline-flex items-center rounded-full bg-indigo-50 border border-indigo-200 px-2 py-0.5 text-[10px] font-semibold text-indigo-600 flex-shrink-0">
                  Gốc
                </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2">
                {isEditing ? (
                    <>
                      <button
                          onClick={handleSaveEdit}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                          title="Lưu"
                      >
                        <Save className="h-3.5 w-3.5" />
                      </button>
                      <button
                          onClick={() => setEditingNode(null)}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
                          title="Hủy"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </>
                ) : (
                    <>
                      <button
                          onClick={() => handleAddChild(node)}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-purple-600 hover:bg-purple-50 transition-colors"
                          title="Thêm danh mục con"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                      <button
                          onClick={() => handleEdit(node, parentId)}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Sửa"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                      <button
                          onClick={() => confirmDelete(node)}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                          title="Xóa mềm"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </>
                )}
              </div>
            </div>

            {/* Mô tả & inline edit */}
            {node.moTa && !isEditing && (
                <p className="mt-1 ml-[72px] text-xs text-slate-400 italic">{node.moTa}</p>
            )}
            {isEditing && (
                <div className="mt-1 ml-[72px] pr-3">
                  <textarea
                      value={editForm.moTa || ''}
                      onChange={(e) => setEditForm({ ...editForm, moTa: e.target.value })}
                      placeholder="Mô tả..."
                      rows={2}
                      className="w-full rounded-md border border-purple-300 bg-white px-3 py-1.5 text-xs outline-none focus:border-purple-500 resize-none"
                  />
                </div>
            )}
          </div>

          {/* ── Danh sách con & form tạo con ── */}
          {isExpanded && (
              <div className="mt-1">
                {/* Chỉ render danh sách con khi node đang mở (isExpanded=true)
                → tránh render toàn bộ cây cùng lúc, tối ưu hiệu năng DOM. */}
                {allChildren.map((child) => renderNode(child, level + 1, node.id))}
                {/* Form tạo con xuất hiện ngay dưới cùng của danh sách con khi đang tạo mới. */}
                {isCreating && renderCreateForm(node.id)}
              </div>
          )}
        </div>
    );
  };

  return (
      <div
          className="lux-sync warehouse-unified p-6 space-y-6 bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 min-h-screen"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
      >

        {/* ── Delete Confirm Modal ── */}
        {deleteModal.show && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
              <div className="w-[420px] rounded-2xl bg-white shadow-2xl p-6 animate-in fade-in zoom-in-95">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                  </div>
                  <h3 className="text-base font-semibold text-slate-800">Xác nhận xóa danh mục</h3>
                </div>
                <p className="text-sm text-slate-600 mb-1">
                  Bạn có chắc chắn muốn xóa <strong className="text-slate-800">"{deleteModal.nodeName}"</strong>?
                </p>
                <p className="text-xs text-red-500 font-medium mb-6">
                  Danh mục sẽ được chuyển sang trạng thái ngừng hoạt động và vẫn hiển thị mờ trong danh sách.
                </p>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => setDeleteModal({ show: false })} className="border-gray-300">
                    Hủy
                  </Button>
                  <Button size="sm" onClick={handleDelete} className="bg-red-500 hover:bg-red-600 text-white">
                    Xác nhận xóa
                  </Button>
                </div>
              </div>
            </div>
        )}

        {/* ── Stats ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-blue-50 to-white">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng danh mục</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Tag className="h-6 w-6 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-green-50 to-white">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Danh mục gốc</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.root}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <Folder className="h-6 w-6 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-gray-50 to-white">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Danh mục con</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.sub}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <Layers className="h-6 w-6 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center justify-end">
          <Button
              size="sm"
              onClick={handleAddRoot}
              className="gap-1.5 border border-[#b8860b]/20 bg-gradient-to-br from-[#d4a72b] to-[#b8860b] text-white shadow-md hover:from-[#c79616] hover:to-[#a97700]"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            <Plus className="h-4 w-4" />
            Thêm danh mục gốc
          </Button>
        </div>

        {/* ── Main Card ── */}
        <Card className="border-0 shadow-lg bg-white">
          <CardHeader className="border-b border-slate-100 pb-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <CardTitle
                    className="flex items-center gap-2 text-lg font-semibold text-gray-900"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  <Tag className="h-5 w-5 text-purple-600" />
                  Danh mục sản phẩm
                </CardTitle>
                <p className="mt-1 text-sm text-slate-500">Kéo và thả để thay đổi mối quan hệ cha – con</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchTreeData}
                    disabled={isLoading}
                    className="gap-1.5 border-gray-300 hover:bg-gray-50"
                >
                  <RefreshCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                  Làm mới
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-5">
            {/* Drop-to-root zone */}
            <div
                onDragOver={(e) => { e.preventDefault(); setDragOverNode('root'); }}
                onDragLeave={() => setDragOverNode(null)}
                onDrop={handleDropToRoot}
                className={`rounded-xl min-h-[400px] transition-all duration-200
              ${dragOverNode === 'root' ? 'bg-purple-50 ring-2 ring-purple-300' : 'bg-slate-50/60'}
              p-3
            `}
            >
              {creatingNode === 'root' && renderCreateForm('root')}

              {treeData.filter(node => node.trangThai !== 0).length === 0 && creatingNode !== 'root' ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                      <Tag className="h-8 w-8 text-slate-300" />
                    </div>
                    <p className="text-sm font-medium text-slate-500">Chưa có danh mục nào</p>
                    <p className="mt-1 text-xs text-slate-400">Nhấn "Thêm danh mục gốc" để bắt đầu</p>
                  </div>
              ) : (
                  // Render toàn bộ node gốc (level=0, parentId=null).
                  // Mỗi node tự đệ quy render node con thông qua renderNode(child, level+1, node.id).
                  // Chỉ hiển thị danh mục gốc đang hoạt động (trangThai !== 0)
                  treeData.filter(node => node.trangThai !== 0).map((node) => renderNode(node, 0, null))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
  );
};

export default DanhMucQuanAoTree;

