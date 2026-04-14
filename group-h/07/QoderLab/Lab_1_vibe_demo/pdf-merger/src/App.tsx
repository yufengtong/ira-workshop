import { useState, useCallback, useEffect } from 'react';
import type { PersonGroup } from './types';
import PersonSidebar from './components/PersonSidebar';
import PersonWorkspace from './components/PersonWorkspace';
import MergePanel from './components/MergePanel';

function App() {
  const [groups, setGroups] = useState<PersonGroup[]>([]);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [showMergePanel, setShowMergePanel] = useState(false);

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + M: 切换合并面板
      if ((e.ctrlKey || e.metaKey) && e.key === 'm') {
        e.preventDefault();
        setShowMergePanel(prev => !prev);
      }
      // Delete: 删除选中人员
      if (e.key === 'Delete' && activeGroupId && !showMergePanel) {
        e.preventDefault();
        const group = groups.find(g => g.id === activeGroupId);
        if (group && confirm(`确定要删除 "${group.name}" 吗？`)) {
          handleDeleteGroup(activeGroupId);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeGroupId, groups, showMergePanel]);

  const handleAddGroup = useCallback((name: string) => {
    const newGroup: PersonGroup = {
      id: crypto.randomUUID(),
      name,
      pdfList: [],
      createdAt: Date.now(),
    };
    setGroups(prev => [...prev, newGroup]);
    setActiveGroupId(newGroup.id);
  }, []);

  const handleDeleteGroup = useCallback((id: string) => {
    setGroups(prev => prev.filter(g => g.id !== id));
    if (activeGroupId === id) {
      setActiveGroupId(null);
    }
  }, [activeGroupId]);

  const handleSelectGroup = useCallback((id: string) => {
    setActiveGroupId(id);
  }, []);

  const handleUpdateGroup = useCallback((updatedGroup: PersonGroup) => {
    setGroups(prev => prev.map(g => g.id === updatedGroup.id ? updatedGroup : g));
  }, []);

  const handleMergeComplete = useCallback(() => {
    // 合并完成后的回调，可以添加统计或其他逻辑
    console.log('Merge completed');
  }, []);

  const activeGroup = groups.find(g => g.id === activeGroupId) || null;
  const totalFiles = groups.reduce((sum, g) => sum + g.pdfList.length, 0);
  const totalPages = groups.reduce((sum, g) => sum + g.pdfList.reduce((s, p) => s + p.pageCount, 0), 0);

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* 顶部导航栏 */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">PDF 合并工具</h1>
            <p className="text-sm text-gray-600 mt-1">
              按人员分组管理，拖拽排序，批量合并PDF
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* 全局统计 */}
            <div className="text-sm text-gray-600">
              <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 rounded-full font-medium">
                {groups.length} 人
              </span>
              <span className="inline-block px-3 py-1 bg-green-50 text-green-700 rounded-full font-medium ml-2">
                {totalFiles} 文件
              </span>
              <span className="inline-block px-3 py-1 bg-purple-50 text-purple-700 rounded-full font-medium ml-2">
                {totalPages} 页
              </span>
            </div>
            
            {/* 切换合并面板按钮 */}
            <button
              onClick={() => setShowMergePanel(prev => !prev)}
              className={`
                px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200
                ${showMergePanel
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }
              `}
            >
              {showMergePanel ? '隐藏' : '批量合并'}
            </button>
          </div>
        </div>
      </header>

      {/* 主内容区 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左侧人员列表 */}
        <div className="w-72 flex-shrink-0">
          <PersonSidebar
            groups={groups}
            activeGroupId={activeGroupId}
            onSelectGroup={handleSelectGroup}
            onAddGroup={handleAddGroup}
            onDeleteGroup={handleDeleteGroup}
          />
        </div>

        {/* 中间工作区 */}
        <div className="flex-1">
          {activeGroup ? (
            <PersonWorkspace
              group={activeGroup}
              onUpdateGroup={handleUpdateGroup}
              onMerge={handleMergeComplete}
            />
          ) : (
            <div className="h-full flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <svg className="w-20 h-20 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">选择或创建人员</h3>
                <p className="text-sm text-gray-600 mb-4">从左侧列表选择一个人员，或添加新人员开始</p>
                <button
                  onClick={() => {
                    const name = prompt('请输入人员姓名：');
                    if (name && name.trim()) {
                      handleAddGroup(name.trim());
                    }
                  }}
                  className="px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  添加人员
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 右侧合并面板 */}
        {showMergePanel && (
          <div className="w-80 flex-shrink-0">
            <MergePanel
              groups={groups}
              onMergeComplete={handleMergeComplete}
            />
          </div>
        )}
      </div>

      {/* 底部状态栏 */}
      <footer className="bg-white border-t border-gray-200 px-6 py-2">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <div>
            {activeGroup ? (
              <span>当前: <span className="font-medium text-gray-900">{activeGroup.name}</span> · {activeGroup.pdfList.length} 个文件</span>
            ) : (
              <span>未选择人员</span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span>快捷键: Ctrl+M 切换合并面板</span>
            <span>Delete 删除当前人员</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
