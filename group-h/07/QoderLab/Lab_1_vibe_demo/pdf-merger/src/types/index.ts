export interface PdfFile {
  id: string;
  file: File;
  name: string;
  pageCount: number;
  size: number;
}

export interface PersonGroup {
  id: string;
  name: string;
  pdfList: PdfFile[];
  createdAt: number;
}

export type MergeMode = 'individual' | 'combined';
