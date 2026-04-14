import React, { useState } from 'react';
import type { PersonGroup } from '../types';
import { mergePdfs, downloadPdf } from '../utils/pdf';
import { createZipAndDownload, type ZipFile } from '../utils/zip';

interface MergePanelProps {
  groups: PersonGroup[];
  onMergeComplete: () => void;
}

const MergePanel: React.FC<MergePanelProps> = ({ groups, onMergeComplete }) => {
  const [isMerging, setIsMerging] = useState(false);
  const [mergeMode, setMergeMode] = useState<'individual' | 'combined'>('individual');
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const handleBatchMerge = async () => {
    const validGroups = groups.filter(g => g.pdfList.length >= 2);
    
    if (validGroups.length === 0) {
      alert('至少需要1个人员有2个或以上的PDF文件才能合并');
      return;
    }

    setIsMerging(true);
    setProgress({ current: 0, total: validGroups.length });

    try {
      if (mergeMode === 'individual') {
        // 分别合并每个人的PDF
        for (let i = 0; i < validGroups.length; i++) {
          const group = validGroups[i];
          setProgress({ current: i + 1, total: validGroups.length });
          
          const files = group.pdfList.map(pdf => pdf.file);
          const mergedPdfBytes = await mergePdfs(files);
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
          downloadPdf(mergedPdfBytes, `${group.name}_合并_${timestamp}.pdf`);
          
          // 添加小延迟避免浏览器阻止多次下载
          if (i < validGroups.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }
        
        alert(`成功合并 ${validGroups.length} 个人员的PDF文件！`);
      } else {
        // 总合并：所有人的PDF合并成一个
        setProgress({ current: 1, total: 2 });
        
        const allFiles: File[] = [];
        for (const group of validGroups) {
          allFiles.push(...group.pdfList.map(pdf => pdf.file));
        }
        
        setProgress({ current: 2, total: 2 });
        const mergedPdfBytes = await mergePdfs(allFiles);
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        downloadPdf(mergedPdfBytes, `全部人员_合并_${timestamp}.pdf`);
        
        alert(`成功合并所有人员的PDF文件，共 ${validGroups.length} 人，${allFiles.length} 个文件！`);
      }
      
      onMergeComplete();
    } catch (error) {
      console.error('Batch merge failed', error);
      alert('批量合并失败，请重试');
    } finally {
      setIsMerging(false);
      setProgress({ current: 0, total: 0 });
    }
  };

  const handleZipDownload = async () => {
    const validGroups = groups.filter(g => g.pdfList.length >= 2);
    
    if (validGroups.length === 0) {
      alert('至少需要1个人员有2个或以上的PDF文件才能合并');
      return;
    }

    setIsMerging(true);
    setProgress({ current: 0, total: validGroups.length });

    try {
      const zipFiles: ZipFile[] = [];
      
      for (let i = 0; i < validGroups.length; i++) {
        const group = validGroups[i];
        setProgress({ current: i + 1, total: validGroups.length });
        
        const files = group.pdfList.map(pdf => pdf.file);
        const mergedPdfBytes = await mergePdfs(files);
        zipFiles.push({
          name: `${group.name}_合并.pdf`,
          data: mergedPdfBytes,
        });
      }
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      await createZipAndDownload(zipFiles, `PDF合并文件_${timestamp}.zip`);
      
      alert(`成功打包 ${validGroups.length} 个合并文件到ZIP！`);
      onMergeComplete();
    } catch (error) {
      console.error('ZIP download failed', error);
      alert('打包下载失败，请重试');
    } finally {
      setIsMerging(false);
      setProgress({ current: 0, total: 0 });
    }
  };

  const validGroups = groups.filter(g => g.pdfList.length >= 2);
  const totalPages = groups.reduce((sum, g) => sum + g.pdfList.reduce((s, p) => s + p.pageCount, 0), 0);

  return (
    <div className="bg-white border-l border-gray-200 h-full flex flex-col">
      {/* 标题栏 */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">批量合并</h2>
        <p className="text-xs text-gray-600">
          共 {groups.length} 人 · {groups.reduce((sum, g) => sum + g.pdfList.length, 0)} 个文件 · {totalPages} 页
        </p>
      </div>

      {/* 合并设置 */}
      <div className="p-4 border-b border-gray-200 space-y-4">
        {/* 合并模式选择 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">合并模式</label>
          <div className="space-y-2">
            <label className="flex items-start cursor-pointer">
              <input
                type="radio"
                name="mergeMode"
                value="individual"
                checked={mergeMode === 'individual'}
                onChange={(e) => setMergeMode(e.target.value as 'individual')}
                className="mt-1 mr-2"
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">分别合并</p>
                <p className="text-xs text-gray-500">每人生成一个独立的合并文件</p>
              </div>
            </label>
            <label className="flex items-start cursor-pointer">
              <input
                type="radio"
                name="mergeMode"
                value="combined"
                checked={mergeMode === 'combined'}
                onChange={(e) => setMergeMode(e.target.value as 'combined')}
                className="mt-1 mr-2"
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">总合并</p>
                <p className="text-xs text-gray-500">所有人的PDF合并成一个文件</p>
              </div>
            </label>
          </div>
        </div>

        {/* 统计信息 */}
        <div className="bg-blue-50 rounded-lg p-3 text-sm">
          <p className="text-gray-700">
            <span className="font-medium">可合并：</span>
            <span className="text-blue-600 font-semibold">{validGroups.length}</span> 人
          </p>
          {groups.length - validGroups.length > 0 && (
            <p className="text-xs text-gray-500 mt-1">
              {groups.length - validGroups.length} 人文件数不足（需要至少2个）
            </p>
          )}
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="p-4 space-y-2">
        <button
          onClick={handleBatchMerge}
          disabled={isMerging || validGroups.length === 0}
          className={`
            w-full px-4 py-2.5 text-sm font-medium text-white rounded-lg transition-all duration-200
            ${isMerging || validGroups.length === 0
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 shadow-sm hover:shadow-md'
            }
          `}
        >
          {isMerging ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              合并中 ({progress.current}/{progress.total})
            </span>
          ) : (
            `批量合并 (${validGroups.length}人)`
          )}
        </button>

        <button
          onClick={handleZipDownload}
          disabled={isMerging || validGroups.length === 0}
          className={`
            w-full px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200
            ${isMerging || validGroups.length === 0
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }
          `}
        >
          打包ZIP下载
        </button>
      </div>

      {/* 人员列表预览 */}
      <div className="flex-1 overflow-y-auto p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">人员详情</h3>
        <div className="space-y-2">
          {groups.map(group => (
            <div
              key={group.id}
              className={`
                p-3 rounded-lg border text-sm
                ${group.pdfList.length >= 2
                  ? 'bg-green-50 border-green-200'
                  : 'bg-gray-50 border-gray-200'
                }
              `}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900">{group.name}</span>
                {group.pdfList.length >= 2 ? (
                  <span className="text-xs text-green-600 font-medium">✓ 可合并</span>
                ) : (
                  <span className="text-xs text-gray-500">{group.pdfList.length} 个文件</span>
                )}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {group.pdfList.length} 个文件 · {group.pdfList.reduce((sum, p) => sum + p.pageCount, 0)} 页
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MergePanel;
