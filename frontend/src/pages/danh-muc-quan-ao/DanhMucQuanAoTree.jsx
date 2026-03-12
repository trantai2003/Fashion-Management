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

const DanhMucQuanAoTree = () => {
  const [treeData, setTreeData] = useState([]);
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  const [draggedNode, setDraggedNode] = useState(null);
  const [dragOverNode, setDragOverNode] = useState(null);
  const [editingNode, setEditingNode] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [creatingNode, setCreatingNode] = useState(null);
  const [createForm, setCreateForm] = useState({
    maDanhMuc: '',
    tenDanhMuc: '',
    moTa: '',
    trangThai: 1,
  });
  const [deleteModal, setDeleteModal] = useState({ show: false, nodeId: null, nodeName: '' });
  const [isLoading, setIsLoading] = useState(false);

  // ── Stats ──────────────────────────────────────────────────────────────────
  const [stats, setStats] = useState({ total: 0, root: 0, sub: 0 });

  const computeStats = (nodes) => {
    let total = 0;
    let root = 0;
    let sub = 0;
    const walk = (list, level) => {
      list.forEach((n) => {
        if (n.trangThai === 0) return;
        total++;
        if (level === 0) root++; else sub++;
        if (n.danhMucCons?.length) walk(n.danhMucCons, level + 1);
      });
    };
    walk(nodes, 0);
    return { total, root, sub };
  };

  useEffect(() => { fetchTreeData(); }, []);

  const fetchTreeData = async () => {
    try {
      setIsLoading(true);
      const response = await danhMucQuanAoService.getCayDanhMuc();
      if (response.data.status === 200) {
        const data = response.data.data;
        setTreeData(data);
        setStats(computeStats(data));
        const allIds = new Set();
        const collectIds = (nodes) => {
          nodes.forEach((node) => {
            allIds.add(node.id);
            if (node.danhMucCons?.length) collectIds(node.danhMucCons);
          });
        };
        collectIds(data);
        setExpandedNodes(allIds);
      }
    } catch {
      toast.error('Không thể tải dữ liệu danh mục');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleExpand = (nodeId) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) newExpanded.delete(nodeId);
    else newExpanded.add(nodeId);
    setExpandedNodes(newExpanded);
  };

  // ── Drag & Drop ────────────────────────────────────────────────────────────
  const handleDragStart = (e, node, parentId) => {
    e.stopPropagation();
    setDraggedNode({ ...node, currentParentId: parentId });
    e.dataTransfer.effectAllowed = 'move';
  };
  const handleDragOver = (e, node) => {
    e.preventDefault(); e.stopPropagation();
    if (draggedNode && draggedNode.id !== node.id && !isDescendant(draggedNode, node))
      setDragOverNode(node.id);
  };
  const handleDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); setDragOverNode(null); };

  const handleDrop = async (e, targetNode) => {
    e.preventDefault(); e.stopPropagation(); setDragOverNode(null);
    if (!draggedNode || draggedNode.id === targetNode.id) { setDraggedNode(null); return; }
    if (isDescendant(draggedNode, targetNode)) {
      toast.warning('Không thể kéo danh mục cha vào con của nó');
      setDraggedNode(null); return;
    }
    try {
      const response = await danhMucQuanAoService.update({
        id: draggedNode.id, tenDanhMuc: draggedNode.tenDanhMuc,
        danhMucChaId: targetNode.id, moTa: draggedNode.moTa, trangThai: draggedNode.trangThai,
      });
      if (response.data.status === 200) { toast.success('Cập nhật thành công'); fetchTreeData(); }
      else toast.error('Cập nhật thất bại: ' + response.data.message);
    } catch { toast.error('Có lỗi xảy ra khi cập nhật'); }
    setDraggedNode(null);
  };

  const handleDropToRoot = async (e) => {
    e.preventDefault(); e.stopPropagation(); setDragOverNode(null);
    if (!draggedNode) return;
    try {
      const response = await danhMucQuanAoService.update({
        id: draggedNode.id, tenDanhMuc: draggedNode.tenDanhMuc,
        danhMucChaId: null, moTa: draggedNode.moTa, trangThai: draggedNode.trangThai,
      });
      if (response.data.status === 200) { toast.success('Đã chuyển thành danh mục gốc!'); fetchTreeData(); }
      else toast.error('Cập nhật thất bại: ' + response.data.message);
    } catch { toast.error('Có lỗi xảy ra khi cập nhật'); }
    setDraggedNode(null);
  };

  const isDescendant = (sourceNode, targetNode) => {
    if (!sourceNode.danhMucCons?.length) return false;
    for (const child of sourceNode.danhMucCons) {
      if (child.id === targetNode.id) return true;
      if (isDescendant(child, targetNode)) return true;
    }
    return false;
  };

  // ── Edit ──────────────────────────────────────────────────────────────────
  const handleEdit = (node, parentId) => {
    setEditingNode(node.id);
    setEditForm({ id: node.id, tenDanhMuc: node.tenDanhMuc, moTa: node.moTa, trangThai: node.trangThai, danhMucChaId: parentId });
  };
  const handleSaveEdit = async () => {
    try {
      const response = await danhMucQuanAoService.update(editForm);
      if (response.data.status === 200) { toast.success('Cập nhật thành công!'); setEditingNode(null); fetchTreeData(); }
      else toast.error('Cập nhật thất bại: ' + response.data.message);
    } catch { toast.error('Có lỗi xảy ra khi cập nhật'); }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const confirmDelete = (node) => setDeleteModal({ show: true, nodeId: node.id, nodeName: node.tenDanhMuc });
  const handleDelete = async () => {
    try {
      const response = await danhMucQuanAoService.delete(deleteModal.nodeId);
      if (response.data.status === 200) { toast.success(`Đã xóa danh mục "${deleteModal.nodeName}"`); fetchTreeData(); }
    } catch { toast.error('Lỗi khi xóa danh mục'); }
    finally { setDeleteModal({ show: false, nodeId: null, nodeName: '' }); }
  };

  // ── Create ────────────────────────────────────────────────────────────────
  const handleAddChild = (parentNode) => {
    setCreatingNode(parentNode.id);
    setCreateForm({ maDanhMuc: '', tenDanhMuc: '', moTa: '', trangThai: 1, danhMucChaId: parentNode.id });
    const newExpanded = new Set(expandedNodes);
    newExpanded.add(parentNode.id);
    setExpandedNodes(newExpanded);
  };
  const handleSaveCreate = async () => {
    if (!createForm.tenDanhMuc.trim()) { toast.warning('Vui lòng nhập tên danh mục!'); return; }
    if (!createForm.maDanhMuc.trim()) { toast.warning('Vui lòng nhập mã danh mục!'); return; }
    try {
      const response = await danhMucQuanAoService.create(createForm);
      if (response.data.status === 200) {
        toast.success('Tạo danh mục thành công!');
        setCreatingNode(null);
        setCreateForm({ maDanhMuc: '', tenDanhMuc: '', moTa: '', trangThai: 1 });
        fetchTreeData();
      } else toast.error('Tạo danh mục thất bại: ' + response.data.message);
    } catch { toast.error('Có lỗi xảy ra khi tạo danh mục'); }
  };
  const handleCancelCreate = () => {
    setCreatingNode(null);
    setCreateForm({ maDanhMuc: '', tenDanhMuc: '', moTa: '', trangThai: 1 });
  };
  const handleAddRoot = () => {
    setCreatingNode('root');
    setCreateForm({ maDanhMuc: '', tenDanhMuc: '', moTa: '', trangThai: 1, danhMucChaId: null });
  };

  // ── Render create form ────────────────────────────────────────────────────
  const renderCreateForm = (parentId) => (
    <div className={`my-2 ${parentId !== 'root' ? 'ml-5' : ''}`}>
      <div className="rounded-xl border-2 border-purple-300 bg-purple-50/60 p-4 shadow-sm">
        <p className="text-xs font-semibold text-purple-700 mb-3 uppercase tracking-wide">
          {parentId === 'root' ? 'Thêm danh mục gốc mới' : 'Thêm danh mục con'}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600">Mã danh mục *</label>
            <Input
              value={createForm.maDanhMuc}
              onChange={(e) => setCreateForm({ ...createForm, maDanhMuc: e.target.value })}
              placeholder="VD: DM001"
              className="h-8 text-sm border-purple-200 focus:border-purple-500"
              autoFocus
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600">Tên danh mục *</label>
            <Input
              value={createForm.tenDanhMuc}
              onChange={(e) => setCreateForm({ ...createForm, tenDanhMuc: e.target.value })}
              placeholder="VD: Áo thun"
              className="h-8 text-sm border-purple-200 focus:border-purple-500"
            />
          </div>
        </div>
        <div className="space-y-1 mb-3">
          <label className="text-xs font-medium text-gray-600">Mô tả</label>
          <textarea
            value={createForm.moTa}
            onChange={(e) => setCreateForm({ ...createForm, moTa: e.target.value })}
            placeholder="Nhập mô tả..."
            rows={2}
            className="w-full rounded-md border border-purple-200 bg-white px-3 py-2 text-sm outline-none focus:border-purple-500 resize-none"
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button size="sm" variant="outline" onClick={handleCancelCreate} className="h-8 gap-1.5 border-gray-300 hover:bg-gray-100">
            <X className="h-3.5 w-3.5" /> Hủy
          </Button>
          <Button size="sm" onClick={handleSaveCreate} className="h-8 gap-1.5 bg-purple-600 hover:bg-purple-700 text-white">
            <Save className="h-3.5 w-3.5" /> Lưu
          </Button>
        </div>
      </div>
    </div>
  );

  // ── Render node ───────────────────────────────────────────────────────────
  const renderNode = (node, level = 0, parentId = null) => {
    if (node.trangThai === 0) return null;
    const activeChildren = node.danhMucCons ? node.danhMucCons.filter((c) => c.trangThai !== 0) : [];
    const hasChildren = activeChildren.length > 0;
    const isExpanded = expandedNodes.has(node.id);
    const isDragOver = dragOverNode === node.id;
    const isEditing = editingNode === node.id;
    const isCreating = creatingNode === node.id;

    return (
      <div key={node.id} style={{ marginLeft: level * 20 }}>
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
          `}>
            {/* Left */}
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <GripVertical className="h-4 w-4 text-gray-300 group-hover:text-gray-400 flex-shrink-0" />

              {(hasChildren || isCreating) ? (
                <button
                  onClick={() => toggleExpand(node.id)}
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
                    title="Xóa"
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

        {/* Children */}
        {isExpanded && (
          <div className="mt-1">
            {isCreating && renderCreateForm(node.id)}
            {hasChildren && node.danhMucCons.map((child) => renderNode(child, level + 1, node.id))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 min-h-screen">

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
              Hành động này sẽ xóa toàn bộ các danh mục con liên quan và không thể hoàn tác.
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
        <Card className="border-0 shadow-md bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng danh mục</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
              <Tag className="h-6 w-6 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md bg-gradient-to-br from-indigo-50 to-white">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Danh mục gốc</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.root}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
              <Folder className="h-6 w-6 text-indigo-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md bg-gradient-to-br from-orange-50 to-white">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Danh mục con</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.sub}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
              <Layers className="h-6 w-6 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Main Card ── */}
      <Card className="border-0 shadow-lg bg-white">
        <CardHeader className="border-b border-slate-100 pb-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
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
              <Button
                size="sm"
                onClick={handleAddRoot}
                className="gap-1.5 bg-purple-600 hover:bg-purple-700 text-white shadow-sm"
              >
                <Plus className="h-4 w-4" />
                Thêm danh mục gốc
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

            {treeData.length === 0 && creatingNode !== 'root' ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                  <Tag className="h-8 w-8 text-slate-300" />
                </div>
                <p className="text-sm font-medium text-slate-500">Chưa có danh mục nào</p>
                <p className="mt-1 text-xs text-slate-400">Nhấn "Thêm danh mục gốc" để bắt đầu</p>
              </div>
            ) : (
              treeData.map((node) => renderNode(node, 0, null))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DanhMucQuanAoTree;


