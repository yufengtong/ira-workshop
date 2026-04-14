import { NextRequest, NextResponse } from 'next/server';
import { SkillDB, CreateSkillInput } from '@/lib/db';
import { GitHelper } from '@/lib/git';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const category = formData.get('category') as string | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: '请上传 ZIP 文件' },
        { status: 400 }
      );
    }

    if (!file.name.endsWith('.zip')) {
      return NextResponse.json(
        { success: false, error: '仅支持 .zip 格式的文件' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await GitHelper.extractZipToSkillDir(buffer);

    if (!result) {
      return NextResponse.json(
        { success: false, error: 'ZIP 中未找到 SKILL.md，请确保压缩包遵循 Skill 标准目录结构' },
        { status: 400 }
      );
    }

    const { dirName, skillInfo } = result;

    const input: CreateSkillInput = {
      name: skillInfo.name,
      description: skillInfo.description,
      content: skillInfo.skillMdContent,
      author: skillInfo.author,
      version: skillInfo.version,
      tags: skillInfo.tags,
      category: category || 'ZIP Import',
      sourceType: 'manual',
      filePath: dirName,
    };

    const skill = SkillDB.create(input);

    return NextResponse.json({
      success: true,
      data: {
        ...skill,
        skillFiles: skillInfo.files,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Error uploading skill:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload skill' },
      { status: 500 }
    );
  }
}
