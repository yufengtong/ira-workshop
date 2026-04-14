import { NextRequest, NextResponse } from 'next/server';
import { SkillDB } from '@/lib/db';
import { GitHelper } from '@/lib/git';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const skillId = parseInt(id);

    if (isNaN(skillId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid skill ID' },
        { status: 400 }
      );
    }

    const existingSkill = SkillDB.getById(skillId);
    if (!existingSkill) {
      return NextResponse.json(
        { success: false, error: 'Skill not found' },
        { status: 404 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file || !file.name.endsWith('.zip')) {
      return NextResponse.json(
        { success: false, error: '请上传 .zip 格式的文件' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // 使用现有目录名覆盖
    const targetDirName = existingSkill.filePath || undefined;
    const result = await GitHelper.extractZipToSkillDir(buffer, targetDirName);

    if (!result) {
      return NextResponse.json(
        { success: false, error: 'ZIP 中未找到 SKILL.md，请确保压缩包遵循 Skill 标准目录结构' },
        { status: 400 }
      );
    }

    const { dirName, skillInfo } = result;

    // 更新数据库记录
    const updatedSkill = SkillDB.update(skillId, {
      name: skillInfo.name,
      description: skillInfo.description,
      author: skillInfo.author,
      version: skillInfo.version,
      tags: skillInfo.tags,
    });

    // 如果 filePath 发生变化，需要更新
    if (existingSkill.filePath !== dirName) {
      const db = require('@/lib/db');
      db.SkillDB.update(skillId, { filePath: dirName } as any);
    }

    return NextResponse.json({
      success: true,
      data: {
        ...updatedSkill,
        skillFiles: skillInfo.files,
      },
    });
  } catch (error) {
    console.error('Error uploading skill update:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload skill update' },
      { status: 500 }
    );
  }
}
