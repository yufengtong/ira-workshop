import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export interface ZipFile {
  name: string;
  data: Uint8Array;
}

export const createZipAndDownload = async (
  files: ZipFile[],
  zipFileName: string
): Promise<void> => {
  const zip = new JSZip();

  // 添加文件到ZIP
  for (const file of files) {
    zip.file(file.name, file.data);
  }

  // 生成ZIP文件
  const blob = await zip.generateAsync({ type: 'blob' });
  
  // 下载
  saveAs(blob, zipFileName);
};
