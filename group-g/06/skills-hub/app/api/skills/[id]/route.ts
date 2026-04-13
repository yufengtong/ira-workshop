import { NextRequest, NextResponse } from 'next/server';
import { SkillDB, UpdateSkillInput } from '@/lib/db';
import { GitHelper } from '@/lib/git';

export async function GET(
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

    const skill = SkillDB.getById(skillId);
    
    if (!skill) {
      return NextResponse.json(
        { success: false, error: 'Skill not found' },
        { status: 404 }
      );
    }

    // 如果 skill 有 filePath，从文件读取内容并附加文件列表
    const result: any = { ...skill };
    if (skill.filePath) {
      const fileContent = GitHelper.readSkillFile(skill.filePath);
      if (fileContent) {
        result.content = fileContent;
      }
      result.skillFiles = GitHelper.getSkillFiles(skill.filePath);
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Error fetching skill:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch skill' },
      { status: 500 }
    );
  }
}

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

    const body = await request.json();
    
    // 获取现有 skill 信息
    const existingSkill = SkillDB.getById(skillId);
    if (!existingSkill) {
      return NextResponse.json(
        { success: false, error: 'Skill not found' },
        { status: 404 }
      );
    }

    const input: UpdateSkillInput = {
      name: body.name,
      description: body.description,
      content: body.content,
      author: body.author,
      version: body.version,
      tags: body.tags,
      category: body.category,
    };

    const skill = SkillDB.update(skillId, input);
    
    if (!skill) {
      return NextResponse.json(
        { success: false, error: 'Skill not found' },
        { status: 404 }
      );
    }

    // 如果 skill 有 filePath，同步更新 SKILL.md
    if (skill.filePath) {
      GitHelper.updateSkillMd(skill.filePath, {
        name: body.name,
        description: body.description,
        author: body.author,
        version: body.version,
        tags: body.tags,
        body: body.content,
      });
    } else if (body.name) {
      // 对于旧数据（没有 filePath），创建标准目录
      const { dirName } = GitHelper.createSkillDir({
        name: body.name || skill.name,
        description: body.description || skill.description || undefined,
        author: body.author || skill.author || undefined,
        version: body.version || skill.version,
        body: body.content || '',
      });
      // 更新 filePath
      const db = require('@/lib/db');
      db.SkillDB.update(skillId, { filePath: dirName } as any);
    }

    return NextResponse.json({ success: true, data: skill });
  } catch (error) {
    console.error('Error updating skill:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update skill' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // 获取 skill 信息以便删除关联文件
    const skill = SkillDB.getById(skillId);
    
    if (!skill) {
      return NextResponse.json(
        { success: false, error: 'Skill not found' },
        { status: 404 }
      );
    }

    // 如果 skill 有 filePath，删除关联目录
    if (skill.filePath) {
      GitHelper.deleteSkillDir(skill.filePath);
    }

    const deleted = SkillDB.delete(skillId);
    
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Skill not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: 'Skill deleted successfully' });
  } catch (error) {
    console.error('Error deleting skill:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete skill' },
      { status: 500 }
    );
  }
}
