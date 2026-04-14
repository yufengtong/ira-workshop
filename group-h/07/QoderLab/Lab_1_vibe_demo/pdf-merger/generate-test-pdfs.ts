import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

async function createTestPdfs() {
  // 创建测试文件目录
  const testDir = join(__dirname, 'test-pdfs');
  mkdirSync(testDir, { recursive: true });

  const font = await StandardFonts.Helvetica;

  // 创建第一个PDF - 介绍文档
  const pdf1 = await PDFDocument.create();
  let page1 = pdf1.addPage([595.28, 841.89]); // A4 size
  page1.drawText('测试文档 1 - 项目介绍', {
    x: 50,
    y: 800,
    size: 24,
    font: await pdf1.embedFont(font),
    color: rgb(0, 0, 0),
  });
  page1.drawText('这是一个关于PDF合并工具的测试文档。\n\n功能特点：\n- 支持拖拽导入PDF文件\n- 支持批量导入\n- 支持拖拽排序\n- 支持删除不需要的文件\n- 按顺序合并PDF\n\n作者：AI Assistant\n日期：2026年4月', {
    x: 50,
    y: 720,
    size: 14,
    font: await pdf1.embedFont(font),
    color: rgb(0.2, 0.2, 0.2),
    lineHeight: 24,
  });

  // 添加第二页
  let page1_2 = pdf1.addPage([595.28, 841.89]);
  page1_2.drawText('测试文档 1 - 第2页', {
    x: 50,
    y: 800,
    size: 20,
    font: await pdf1.embedFont(font),
    color: rgb(0, 0, 0),
  });
  page1_2.drawText('这是第一份文档的第二页内容。\n\n技术栈：\n- React 18\n- TypeScript\n- Vite\n- pdf-lib\n- @dnd-kit\n- TailwindCSS\n\n这个工具可以帮助用户轻松合并多个PDF文件，\n操作简单，界面美观。', {
    x: 50,
    y: 720,
    size: 14,
    font: await pdf1.embedFont(font),
    color: rgb(0.2, 0.2, 0.2),
    lineHeight: 24,
  });

  const pdf1Bytes = await pdf1.save();
  writeFileSync(join(testDir, '01-项目介绍.pdf'), pdf1Bytes);
  console.log('✓ 创建: 01-项目介绍.pdf (2页)');

  // 创建第二个PDF - 用户手册
  const pdf2 = await PDFDocument.create();
  let page2 = pdf2.addPage([595.28, 841.89]);
  page2.drawText('测试文档 2 - 用户手册', {
    x: 50,
    y: 800,
    size: 24,
    font: await pdf2.embedFont(font),
    color: rgb(0, 0, 0),
  });
  page2.drawText('使用指南：\n\n1. 打开PDF合并工具\n2. 拖拽PDF文件到页面\n   或点击选择文件\n3. 调整文件顺序\n4. 点击"合并PDF"按钮\n5. 下载合并后的文件\n\n注意事项：\n- 至少需要2个PDF文件\n- 文件大小无限制\n- 所有操作在本地完成', {
    x: 50,
    y: 720,
    size: 14,
    font: await pdf2.embedFont(font),
    color: rgb(0.2, 0.2, 0.2),
    lineHeight: 24,
  });

  // 添加第二页
  let page2_2 = pdf2.addPage([595.28, 841.89]);
  page2_2.drawText('测试文档 2 - 第2页', {
    x: 50,
    y: 800,
    size: 20,
    font: await pdf2.embedFont(font),
    color: rgb(0, 0, 0),
  });
  page2_2.drawText('这是用户手册的第二页。\n\n常见问题：\n\nQ: 支持哪些文件格式？\nA: 仅支持PDF格式\n\nQ: 合并后会丢失内容吗？\nA: 不会，完整保留所有内容\n\nQ: 可以调整页面顺序吗？\nA: 可以，通过拖拽调整', {
    x: 50,
    y: 720,
    size: 14,
    font: await pdf2.embedFont(font),
    color: rgb(0.2, 0.2, 0.2),
    lineHeight: 24,
  });

  // 添加第三页
  let page2_3 = pdf2.addPage([595.28, 841.89]);
  page2_3.drawText('测试文档 2 - 第3页', {
    x: 50,
    y: 800,
    size: 20,
    font: await pdf2.embedFont(font),
    color: rgb(0, 0, 0),
  });
  page2_3.drawText('这是用户手册的第三页。\n\n快捷键说明：\n\n- Delete: 删除选中的文件\n- Ctrl+Z: 撤销操作\n- Ctrl+S: 保存合并后的文件\n\n技术支持：\n如有问题，请联系技术支持团队。', {
    x: 50,
    y: 720,
    size: 14,
    font: await pdf2.embedFont(font),
    color: rgb(0.2, 0.2, 0.2),
    lineHeight: 24,
  });

  const pdf2Bytes = await pdf2.save();
  writeFileSync(join(testDir, '02-用户手册.pdf'), pdf2Bytes);
  console.log('✓ 创建: 02-用户手册.pdf (3页)');

  // 创建第三个PDF - 技术规格
  const pdf3 = await PDFDocument.create();
  let page3 = pdf3.addPage([595.28, 841.89]);
  page3.drawText('测试文档 3 - 技术规格', {
    x: 50,
    y: 800,
    size: 24,
    font: await pdf3.embedFont(font),
    color: rgb(0, 0, 0),
  });
  page3.drawText('系统要求：\n\n- 现代浏览器（Chrome, Firefox, Edge）\n- 启用JavaScript\n- 至少512MB可用内存\n\n性能指标：\n- 支持最多100个PDF文件\n- 单个文件最大500MB\n- 合并速度：约10页/秒\n\n安全性：\n- 所有处理在浏览器本地完成\n- 不上传任何数据到服务器\n- 保护用户隐私', {
    x: 50,
    y: 720,
    size: 14,
    font: await pdf3.embedFont(font),
    color: rgb(0.2, 0.2, 0.2),
    lineHeight: 24,
  });

  const pdf3Bytes = await pdf3.save();
  writeFileSync(join(testDir, '03-技术规格.pdf'), pdf3Bytes);
  console.log('✓ 创建: 03-技术规格.pdf (1页)');

  // 创建第四个PDF - 版本历史
  const pdf4 = await PDFDocument.create();
  let page4 = pdf4.addPage([595.28, 841.89]);
  page4.drawText('测试文档 4 - 版本历史', {
    x: 50,
    y: 800,
    size: 24,
    font: await pdf4.embedFont(font),
    color: rgb(0, 0, 0),
  });
  page4.drawText('版本记录：\n\nv1.0.0 (2026-04-13)\n- 初始版本发布\n- 支持基本的PDF合并功能\n- 拖拽排序功能\n- 批量导入支持\n\nv1.1.0 (计划中)\n- 添加PDF预览功能\n- 支持页面级别的删除\n- 添加撤销/重做功能\n\nv2.0.0 (计划中)\n- 支持PDF编辑\n- 添加水印功能\n- 支持PDF压缩', {
    x: 50,
    y: 720,
    size: 14,
    font: await pdf4.embedFont(font),
    color: rgb(0.2, 0.2, 0.2),
    lineHeight: 24,
  });

  const pdf4Bytes = await pdf4.save();
  writeFileSync(join(testDir, '04-版本历史.pdf'), pdf4Bytes);
  console.log('✓ 创建: 04-版本历史.pdf (1页)');

  console.log('\n✅ 成功创建 4 个测试PDF文件！');
  console.log(`📁 文件位置: ${testDir}`);
}

createTestPdfs().catch(console.error);
