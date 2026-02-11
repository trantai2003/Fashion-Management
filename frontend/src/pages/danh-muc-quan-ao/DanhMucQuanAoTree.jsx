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
  X
} from 'lucide-react';
import { danhMucQuanAoService } from '@/services/danhMucQuanAoService';

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
    trangThai: 1
  });

  // Fetch dữ liệu từ API
  useEffect(() => {
    fetchTreeData();
  }, []);

  const fetchTreeData = async () => {
    try {
      const response = await danhMucQuanAoService.getCayDanhMuc();
      
      if (response.data.status === 200) {
        setTreeData(response.data.data);
        // Tự động expand tất cả nodes
        const allIds = new Set();
        const collectIds = (nodes) => {
          nodes.forEach(node => {
            allIds.add(node.id);
            if (node.danhMucCons && node.danhMucCons.length > 0) {
              collectIds(node.danhMucCons);
            }
          });
        };
        collectIds(response.data.data);
        setExpandedNodes(allIds);
      }
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu:', error);
      alert('Không thể tải dữ liệu danh mục');
    }
  };

  const toggleExpand = (nodeId) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  // Xử lý kéo thả
  const handleDragStart = (e, node, parentId) => {
    e.stopPropagation();
    setDraggedNode({ ...node, currentParentId: parentId });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, node) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Không cho phép kéo vào chính nó hoặc con của nó
    if (draggedNode && draggedNode.id !== node.id && !isDescendant(draggedNode, node)) {
      setDragOverNode(node.id);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverNode(null);
  };

  const handleDrop = async (e, targetNode) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverNode(null);

    if (!draggedNode || draggedNode.id === targetNode.id) {
      setDraggedNode(null);
      return;
    }

    // Kiểm tra không cho kéo vào con của chính nó
    if (isDescendant(draggedNode, targetNode)) {
      alert('Không thể kéo danh mục cha vào danh mục con của nó!');
      setDraggedNode(null);
      return;
    }

    // Cập nhật mối quan hệ cha con
    try {
      const response = await danhMucQuanAoService.update({
        id: draggedNode.id,
        tenDanhMuc: draggedNode.tenDanhMuc,
        danhMucChaId: targetNode.id,
        moTa: draggedNode.moTa,
        trangThai: draggedNode.trangThai
      });

      if (response.data.status === 200) {
        alert('Cập nhật thành công!');
        fetchTreeData(); // Tải lại dữ liệu
      } else {
        alert('Cập nhật thất bại: ' + response.data.message);
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật:', error);
      alert('Có lỗi xảy ra khi cập nhật');
    }

    setDraggedNode(null);
  };

  // Cho phép kéo vào root (không có cha)
  const handleDropToRoot = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverNode(null);

    if (!draggedNode) return;

    try {
      const response = await danhMucQuanAoService.update({
        id: draggedNode.id,
        tenDanhMuc: draggedNode.tenDanhMuc,
        danhMucChaId: null,
        moTa: draggedNode.moTa,
        trangThai: draggedNode.trangThai
      });

      if (response.data.status === 200) {
        alert('Đã chuyển thành danh mục gốc!');
        fetchTreeData();
      } else {
        alert('Cập nhật thất bại: ' + response.data.message);
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật:', error);
      alert('Có lỗi xảy ra khi cập nhật');
    }

    setDraggedNode(null);
  };

  // Kiểm tra xem targetNode có phải là con của sourceNode không
  const isDescendant = (sourceNode, targetNode) => {
    if (!sourceNode.danhMucCons || sourceNode.danhMucCons.length === 0) {
      return false;
    }

    for (const child of sourceNode.danhMucCons) {
      if (child.id === targetNode.id) {
        return true;
      }
      if (isDescendant(child, targetNode)) {
        return true;
      }
    }
    return false;
  };

  // Xử lý chỉnh sửa
  const handleEdit = (node) => {
    setEditingNode(node.id);
    setEditForm({
      id: node.id,
      tenDanhMuc: node.tenDanhMuc,
      moTa: node.moTa,
      trangThai: node.trangThai
    });
  };

  const handleSaveEdit = async () => {
    try {
      const response = await danhMucQuanAoService.update(editForm);

      if (response.data.status === 200) {
        alert('Cập nhật thành công!');
        setEditingNode(null);
        fetchTreeData();
      } else {
        alert('Cập nhật thất bại: ' + response.data.message);
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật:', error);
      alert('Có lỗi xảy ra khi cập nhật');
    }
  };

  const handleDelete = async (nodeId) => {
    if (!confirm('Bạn có chắc chắn muốn xóa danh mục này?')) {
      return;
    }

    try {
      const response = await danhMucQuanAoService.delete(nodeId);

      if (response.data.status === 200) {
        alert('Xóa thành công!');
        fetchTreeData();
      } else {
        alert('Xóa thất bại: ' + response.data.message);
      }
    } catch (error) {
      console.error('Lỗi khi xóa:', error);
      alert('Có lỗi xảy ra khi xóa');
    }
  };

  // Xử lý tạo danh mục con
  const handleAddChild = (parentNode) => {
    setCreatingNode(parentNode.id);
    setCreateForm({
      maDanhMuc: '',
      tenDanhMuc: '',
      moTa: '',
      trangThai: 1,
      danhMucChaId: parentNode.id
    });
    // Tự động expand node cha
    const newExpanded = new Set(expandedNodes);
    newExpanded.add(parentNode.id);
    setExpandedNodes(newExpanded);
  };

  const handleSaveCreate = async () => {
    if (!createForm.tenDanhMuc.trim()) {
      alert('Vui lòng nhập tên danh mục!');
      return;
    }

    if (!createForm.maDanhMuc.trim()) {
      alert('Vui lòng nhập mã danh mục!');
      return;
    }

    try {
      const response = await danhMucQuanAoService.create(createForm);

      if (response.data.status === 200) {
        alert('Tạo danh mục thành công!');
        setCreatingNode(null);
        setCreateForm({
          maDanhMuc: '',
          tenDanhMuc: '',
          moTa: '',
          trangThai: 1
        });
        fetchTreeData();
      } else {
        alert('Tạo danh mục thất bại: ' + response.data.message);
      }
    } catch (error) {
      console.error('Lỗi khi tạo danh mục:', error);
      alert('Có lỗi xảy ra khi tạo danh mục');
    }
  };

  const handleCancelCreate = () => {
    setCreatingNode(null);
    setCreateForm({
      maDanhMuc: '',
      tenDanhMuc: '',
      moTa: '',
      trangThai: 1
    });
  };

  // Thêm danh mục gốc
  const handleAddRoot = () => {
    setCreatingNode('root');
    setCreateForm({
      maDanhMuc: '',
      tenDanhMuc: '',
      moTa: '',
      trangThai: 1,
      danhMucChaId: null
    });
  };

  // Render form tạo mới
  const renderCreateForm = (parentId) => {
    return (
      <div className="create-form-container" style={{ marginLeft: parentId === 'root' ? 0 : 20 }}>
        <div className="create-form">
          <div className="form-row">
            <div className="form-group">
              <label>Mã danh mục *</label>
              <input
                type="text"
                value={createForm.maDanhMuc}
                onChange={(e) => setCreateForm({ ...createForm, maDanhMuc: e.target.value })}
                placeholder="VD: DM001"
                className="form-input"
                autoFocus
              />
            </div>
            <div className="form-group">
              <label>Tên danh mục *</label>
              <input
                type="text"
                value={createForm.tenDanhMuc}
                onChange={(e) => setCreateForm({ ...createForm, tenDanhMuc: e.target.value })}
                placeholder="VD: Áo thun"
                className="form-input"
              />
            </div>
          </div>
          <div className="form-group">
            <label>Mô tả</label>
            <textarea
              value={createForm.moTa}
              onChange={(e) => setCreateForm({ ...createForm, moTa: e.target.value })}
              placeholder="Nhập mô tả..."
              className="form-textarea"
            />
          </div>
          <div className="form-actions">
            <button onClick={handleSaveCreate} className="btn-save">
              <Save size={16} />
              Lưu
            </button>
            <button onClick={handleCancelCreate} className="btn-cancel">
              <X size={16} />
              Hủy
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render node
  const renderNode = (node, level = 0, parentId = null) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.danhMucCons && node.danhMucCons.length > 0;
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
          className={`tree-node ${isDragOver ? 'drag-over' : ''} ${isEditing ? 'editing' : ''}`}
        >
          <div className="node-content">
            <div className="node-left">
              <GripVertical size={16} className="drag-handle" />
              
              {hasChildren || isCreating ? (
                <button
                  onClick={() => toggleExpand(node.id)}
                  className="expand-button"
                >
                  {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>
              ) : (
                <div style={{ width: 20 }} />
              )}

              {isExpanded && (hasChildren || isCreating) ? (
                <FolderOpen size={18} className="folder-icon" />
              ) : (
                <Folder size={18} className="folder-icon" />
              )}

              {isEditing ? (
                <input
                  type="text"
                  value={editForm.tenDanhMuc}
                  onChange={(e) => setEditForm({ ...editForm, tenDanhMuc: e.target.value })}
                  className="edit-input"
                  autoFocus
                />
              ) : (
                <span className="node-name">{node.tenDanhMuc}</span>
              )}

              <span className="node-code">({node.maDanhMuc})</span>
            </div>

            <div className="node-actions">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSaveEdit}
                    className="action-button save-button"
                    title="Lưu"
                  >
                    <Save size={16} />
                  </button>
                  <button
                    onClick={() => setEditingNode(null)}
                    className="action-button cancel-button"
                    title="Hủy"
                  >
                    <X size={16} />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => handleAddChild(node)}
                    className="action-button add-button"
                    title="Thêm danh mục con"
                  >
                    <Plus size={16} />
                  </button>
                  <button
                    onClick={() => handleEdit(node)}
                    className="action-button edit-button"
                    title="Sửa"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(node.id)}
                    className="action-button delete-button"
                    title="Xóa"
                  >
                    <Trash2 size={16} />
                  </button>
                </>
              )}
            </div>
          </div>

          {node.moTa && !isEditing && (
            <div className="node-description">{node.moTa}</div>
          )}

          {isEditing && (
            <div className="edit-form">
              <textarea
                value={editForm.moTa || ''}
                onChange={(e) => setEditForm({ ...editForm, moTa: e.target.value })}
                placeholder="Mô tả..."
                className="edit-textarea"
              />
            </div>
          )}
        </div>

        {isExpanded && (
          <div className="children-container">
            {isCreating && renderCreateForm(node.id)}
            {hasChildren && node.danhMucCons.map(child => renderNode(child, level + 1, node.id))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="danh-muc-tree-container">
      <div className="header">
        <h2>Quản Lý Danh Mục Quần Áo</h2>
        <p className="instruction">
          Kéo và thả các danh mục để thay đổi mối quan hệ cha-con
        </p>
        <button onClick={handleAddRoot} className="btn-add-root">
          <Plus size={18} />
          Thêm danh mục gốc
        </button>
      </div>

      <div
        className="tree-root"
        onDragOver={(e) => {
          e.preventDefault();
          setDragOverNode('root');
        }}
        onDragLeave={() => setDragOverNode(null)}
        onDrop={handleDropToRoot}
      >
        {creatingNode === 'root' && renderCreateForm('root')}
        
        {treeData.length === 0 && creatingNode !== 'root' ? (
          <div className="empty-state">Không có dữ liệu danh mục</div>
        ) : (
          treeData.map(node => renderNode(node, 0, null))
        )}
      </div>

      <style jsx>{`
        .danh-muc-tree-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
        }

        .header {
          margin-bottom: 30px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
        }

        .header > div {
          flex: 1;
        }

        .header h2 {
          font-size: 24px;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0 0 8px 0;
        }

        .instruction {
          color: #666;
          font-size: 14px;
          margin: 0;
        }

        .btn-add-root {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: #2196F3;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-add-root:hover {
          background: #1976D2;
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(33, 150, 243, 0.3);
        }

        .tree-root {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 20px;
          min-height: 400px;
        }

        .tree-node {
          margin: 4px 0;
          transition: all 0.2s ease;
        }

        .tree-node.drag-over {
          background: #e3f2fd;
          border-radius: 4px;
        }

        .node-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 12px;
          background: white;
          border-radius: 6px;
          border: 2px solid transparent;
          cursor: move;
          transition: all 0.2s ease;
        }

        .tree-node:hover .node-content {
          border-color: #e0e0e0;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }

        .tree-node.editing .node-content {
          cursor: default;
          border-color: #2196F3;
        }

        .node-left {
          display: flex;
          align-items: center;
          gap: 8px;
          flex: 1;
        }

        .drag-handle {
          color: #999;
          cursor: grab;
        }

        .drag-handle:active {
          cursor: grabbing;
        }

        .expand-button {
          background: none;
          border: none;
          padding: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          color: #666;
          border-radius: 4px;
        }

        .expand-button:hover {
          background: #f0f0f0;
        }

        .folder-icon {
          color: #FFA726;
        }

        .node-name {
          font-weight: 500;
          color: #333;
          font-size: 15px;
        }

        .node-code {
          color: #999;
          font-size: 13px;
          margin-left: 8px;
        }

        .node-actions {
          display: flex;
          gap: 4px;
          opacity: 0;
          transition: opacity 0.2s ease;
        }

        .tree-node:hover .node-actions {
          opacity: 1;
        }

        .action-button {
          padding: 6px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          transition: all 0.2s ease;
          background: #f5f5f5;
        }

        .action-button:hover {
          transform: scale(1.1);
        }

        .add-button {
          color: #4CAF50;
        }

        .add-button:hover {
          background: #e8f5e9;
        }

        .edit-button {
          color: #2196F3;
        }

        .edit-button:hover {
          background: #e3f2fd;
        }

        .delete-button {
          color: #f44336;
        }

        .delete-button:hover {
          background: #ffebee;
        }

        .save-button {
          color: #4CAF50;
          opacity: 1;
        }

        .save-button:hover {
          background: #e8f5e9;
        }

        .cancel-button {
          color: #757575;
          opacity: 1;
        }

        .cancel-button:hover {
          background: #f5f5f5;
        }

        .node-description {
          margin-top: 4px;
          padding: 4px 12px 4px 52px;
          color: #666;
          font-size: 13px;
          font-style: italic;
        }

        .edit-input {
          border: 1px solid #2196F3;
          border-radius: 4px;
          padding: 4px 8px;
          font-size: 15px;
          font-weight: 500;
          outline: none;
          min-width: 200px;
        }

        .edit-form {
          margin-top: 8px;
          padding: 0 12px 8px 52px;
        }

        .edit-textarea {
          width: 100%;
          border: 1px solid #2196F3;
          border-radius: 4px;
          padding: 8px;
          font-size: 13px;
          font-family: inherit;
          outline: none;
          resize: vertical;
          min-height: 60px;
        }

        .children-container {
          margin-top: 4px;
        }

        .create-form-container {
          margin: 8px 0;
        }

        .create-form {
          background: white;
          border: 2px solid #4CAF50;
          border-radius: 8px;
          padding: 16px;
          box-shadow: 0 2px 8px rgba(76, 175, 80, 0.15);
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 12px;
          margin-bottom: 12px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-group label {
          font-size: 13px;
          font-weight: 500;
          color: #555;
        }

        .form-input {
          border: 1px solid #ddd;
          border-radius: 4px;
          padding: 8px 12px;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s;
        }

        .form-input:focus {
          border-color: #4CAF50;
        }

        .form-textarea {
          border: 1px solid #ddd;
          border-radius: 4px;
          padding: 8px 12px;
          font-size: 14px;
          font-family: inherit;
          outline: none;
          resize: vertical;
          min-height: 80px;
          transition: border-color 0.2s;
        }

        .form-textarea:focus {
          border-color: #4CAF50;
        }

        .form-actions {
          display: flex;
          gap: 8px;
          justify-content: flex-end;
          margin-top: 12px;
        }

        .btn-save,
        .btn-cancel {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-save {
          background: #4CAF50;
          color: white;
        }

        .btn-save:hover {
          background: #45a049;
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(76, 175, 80, 0.3);
        }

        .btn-cancel {
          background: #f5f5f5;
          color: #666;
        }

        .btn-cancel:hover {
          background: #e0e0e0;
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: #999;
          font-size: 16px;
        }

        @media (max-width: 768px) {
          .danh-muc-tree-container {
            padding: 10px;
          }

          .header {
            flex-direction: column;
            align-items: flex-start;
          }

          .btn-add-root {
            width: 100%;
            justify-content: center;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .node-content {
            padding: 6px 8px;
          }

          .node-name {
            font-size: 14px;
          }

          .node-code {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default DanhMucQuanAoTree;