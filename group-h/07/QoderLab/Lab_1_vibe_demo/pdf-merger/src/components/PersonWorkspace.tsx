import React, { useCallback, useState } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { PersonGroup, PdfFile } from '../types';
import { getPdfPageCount, mergePdfs, downloadPdf } from '../utils/pdf';
import DropZone from './DropZone';
import PdfItem from './PdfItem';

interface PersonWorkspaceProps {
  group: PersonGroup;
  onUpdateGroup: (group: PersonGroup) => void;
  onMerge: (group: PersonGroup) => void;
}

const PersonWorkspace: React.FC<PersonWorkspaceProps> = ({
  group,
  onUpdateGroup,
  onMerge,
}) => {
  const [isMerging, setIsMerging] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleFilesAdded = useCallback(async (files: FileList | File[]) => {
    const pdfFiles = Array.from(files).filter(f => f.type === 'application/pdf');
    
    if (pdfFiles.length === 0) {
      alert('请选择PDF文件');
      return;
    }

    const newPdfs: PdfFile[] = [];
    
    for (const file of pdfFiles) {
      try {
        const pageCount = await getPdfPageCount(file);
        newPdfs.push({
          id: crypto.randomUUID(),
          file,
          name: file.name,
          pageCount,
          size: file.size,
        });
      } catch (error) {
        console.error(`Failed to load PDF: ${file.name}`, error);
        alert(`无法加载文件: ${file.name}`);
      }
    }

    if (newPdfs.length > 0) {
      onUpdateGroup({
        ...group,
        pdfList: [...group.pdfList, ...newPdfs],
      });
    }
  }, [group, onUpdateGroup]);

  const handleDelete = useCallback((id: string) => {
    onUpdateGroup({
      ...group,
      pdfList: group.pdfList.filter(pdf => pdf.id !== id),
    });
  }, [group, onUpdateGroup]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      onUpdateGroup({
        ...group,
        pdfList: (items => {
          const oldIndex = items.findIndex(item => item.id === active.id);
          const newIndex = items.findIndex(item => item.id === over.id);
          return arrayMove(items, oldIndex, newIndex);
        })(group.pdfList),
      });
    }
  }, [group, onUpdateGroup]);

  const handleMerge = useCallback(async () => {
    if (group.pdfList.length < 2) {
      alert('至少需要2个PDF文件才能合并');
      return;
    }

    setIsMerging(true);

    try {
      const files = group.pdfList.map(pdf => pdf.file);
      const mergedPdfBytes = await mergePdfs(files);
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      downloadPdf(mergedPdfBytes, `${group.name}_合并_${timestamp}.pdf`);
      onMerge(group);
    } catch (error) {
      console.error('Failed to merge PDFs', error);
      alert('合并PDF失败，请重试');
    } finally {
      setIsMerging(false);
    }
  }, [group, onMerge]);

  const handleClearAll = useCallback(() => {
    if (group.pdfList.length === 0) return;
    if (confirm(`确定要清空 "${group.name}" 的所有文件吗？`)) {
      onUpdateGroup({
        ...group,
        pdfList: [],
      });
    }
  }, [group, onUpdateGroup]);

  const totalPages = group.pdfList.reduce((sum, pdf) => sum + pdf.pageCount, 0);

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* 顶部信息栏 */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{group.name} 的PDF</h2>
            <p className="text-sm text-gray-600 mt-1">
              已添加 <span className="font-semibold text-blue-600">{group.pdfList.length}</span> 个文件，
              共 <span className="font-semibold text-blue-600">{totalPages}</span> 页
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleClearAll}
              disabled={group.pdfList.length === 0}
              className={`
                px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200
                ${group.pdfList.length === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }
              `}
            >
              清空全部
            </button>
            <button
              onClick={handleMerge}
              disabled={isMerging || group.pdfList.length < 2}
              className={`
                px-6 py-2 text-sm font-medium text-white rounded-lg transition-all duration-200
                ${isMerging || group.pdfList.length < 2
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 shadow-sm hover:shadow-md'
                }
              `}
            >
              {isMerging ? '合并中...' : '合并PDF'}
            </button>
          </div>
        </div>
      </div>

      {/* PDF列表区域 */}
      <div className="flex-1 overflow-y-auto p-4">
        {group.pdfList.length > 0 ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={group.pdfList.map(pdf => pdf.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {group.pdfList.map((pdf, index) => (
                  <PdfItem
                    key={pdf.id}
                    pdf={pdf}
                    onDelete={handleDelete}
                    index={index}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <svg className="w-16 h-16 mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
            <p className="text-lg font-medium">还没有添加PDF文件</p>
            <p className="text-sm mt-1">在下方拖拽或选择PDF文件开始</p>
          </div>
        )}
      </div>

      {/* 添加文件区域 */}
      <div className="bg-white border-t border-gray-200 p-4">
        <DropZone onFilesAdded={handleFilesAdded} />
      </div>
    </div>
  );
};

export default PersonWorkspace;
