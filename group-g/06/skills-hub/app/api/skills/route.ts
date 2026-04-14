import { NextRequest, NextResponse } from 'next/server';
import { SkillDB, CreateSkillInput } from '@/lib/db';
import { GitHelper } from '@/lib/git';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get('keyword');
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    let skills;
    if (keyword) {
      skills = SkillDB.search(keyword, category || undefined);
    } else {
      skills = SkillDB.getAll(limit, offset);
    }

    // 为每个 skill 从文件读取内容并附加文件列表
    const enrichedSkills = skills.map(skill => {
      const result: any = { ...skill };
      if (skill.filePath) {
        const fileContent = GitHelper.readSkillFile(skill.filePath);
        if (fileContent) {
          result.content = fileContent;
        }
        result.skillFiles = GitHelper.getSkillFiles(skill.filePath);
      }
      return result;
    });

    return NextResponse.json({ success: true, data: enrichedSkills });
  } catch (error) {
    console.error('Error fetching skills:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch skills' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.name) {
      return NextResponse.json(
        { success: false, error: 'Name is required' },
        { status: 400 }
      );
    }

    // 创建标准 skill 目录结构
    const { dirName, files } = GitHelper.createSkillDir({
      name: body.name,
      description: body.description,
      author: body.author,
      version: body.version,
      tags: body.tags ? (Array.isArray(body.tags) ? body.tags : body.tags.split(',').map((t: string) => t.trim()).filter(Boolean)) : undefined,
      body: body.content || '',
    });

    // 读取生成的 SKILL.md 内容
    const skillMdContent = GitHelper.readSkillFile(dirName);

    const input: CreateSkillInput = {
      name: body.name,
      description: body.description,
      content: skillMdContent || body.content || '',
      author: body.author,
      version: body.version,
      tags: Array.isArray(body.tags) ? body.tags : body.tags ? body.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : undefined,
      category: body.category,
      sourceType: 'manual',
      filePath: dirName,
    };

    const skill = SkillDB.create(input);
    return NextResponse.json({ success: true, data: { ...skill, skillFiles: files } }, { status: 201 });
  } catch (error) {
    console.error('Error creating skill:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create skill' },
      { status: 500 }
    );
  }
}
