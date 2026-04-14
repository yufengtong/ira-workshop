import React, { useState } from 'react';
import type { PersonGroup } from '../types';

interface PersonSidebarProps {
  groups: PersonGroup[];
  activeGroupId: string | null;
  onSelectGroup: (id: string) => void;
  onAddGroup: (name: string) => void;
  onDeleteGroup: (id: string) => void;
}

const PersonSidebar: React.FC<PersonSidebarProps> = ({
  groups,
  activeGroupId,
  onSelectGroup,
  onAddGroup,
  onDeleteGroup,
}) => {
  const [showAddInput, setShowAddInput] = useState(false);
  const [newPersonName, setNewPersonName] = useState('');

  const handleAddSubmit = () => {
    const name = newPersonName.trim();
    if (name) {
      onAddGroup(name);
      setNewPersonName('');
      setShowAddInput(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddSubmit();
    } else if (e.key === 'Escape') {
      setShowAddInput(false);
      setNewPersonName('');
    }
  };

  return (
    <div className="bg-white border-r border-gray-200 h-full flex flex-col">
      {/* 标题栏 */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">人员列表</h2>
        <button
          onClick={() => setShowAddInput(true)}
          className="w-full px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          添加人员
        </button>
      </div>

      {/* 添加人员输入框 */}
      {showAddInput && (
        <div className="p-3 bg-blue-50 border-b border-gray-200">
          <input
            type="text"
            value={newPersonName}
            onChange={(e) => setNewPersonName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入人员姓名"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleAddSubmit}
              className="flex-1 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700"
            >
              确定
            </button>
            <button
              onClick={() => {
                setShowAddInput(false);
                setNewPersonName('');
              }}
              className="flex-1 px-3 py-1.5 bg-gray-200 text-gray-700 text-xs font-medium rounded hover:bg-gray-300"
            >
              取消
            </button>
          </div>
        </div>
      )}

      {/* 人员列表 */}
      <div className="flex-1 overflow-y-auto">
        {groups.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">
            <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p>暂无人员</p>
            <p className="text-xs mt-1">点击上方按钮添加</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {groups.map((group) => (
              <div
                key={group.id}
                onClick={() => onSelectGroup(group.id)}
                className={`
                  p-3 cursor-pointer transition-all duration-200 hover:bg-gray-50
                  ${activeGroupId === group.id ? 'bg-blue-50 border-l-4 border-blue-600' : 'border-l-4 border-transparent'}
                `}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {group.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {group.pdfList.length} 个文件 · {group.pdfList.reduce((sum, p) => sum + p.pageCount, 0)} 页
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`确定要删除 "${group.name}" 吗？`)) {
                        onDeleteGroup(group.id);
                      }
                    }}
                    className="ml-2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors duration-200"
                    title="删除人员"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 底部统计 */}
      {groups.length > 0 && (
        <div className="p-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-600">
          共 {groups.length} 人 · {groups.reduce((sum, g) => sum + g.pdfList.length, 0)} 个文件
        </div>
      )}
    </div>
  );
};

export default PersonSidebar;
