import { NextRequest, NextResponse } from 'next/server';
import { GitHelper } from '@/lib/git';
import { SkillDB, CreateSkillInput } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, branch, skills: skillDirs, category } = body;

    if (!url || !skillDirs || !Array.isArray(skillDirs) || skillDirs.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Git URL and skills array are required' },
        { status: 400 }
      );
    }

    const importedSkills = [];
    const errors = [];

    for (const dirPath of skillDirs) {
      try {
        // 导入整个 skill 目录到本地 skills/ 下
        const skillInfo = await GitHelper.importSkillDir(url, dirPath, branch);

        if (!skillInfo) {
          errors.push({ path: dirPath, error: 'Skill directory not found or missing SKILL.md' });
          continue;
        }

        // 创建数据库记录，元数据来自 SKILL.md frontmatter
        const input: CreateSkillInput = {
          name: skillInfo.name,
          description: skillInfo.description || `从 ${url} 导入`,
          content: skillInfo.skillMdContent,
          author: skillInfo.author,
          version: skillInfo.version,
          tags: skillInfo.tags,
          category: category || 'Git Import',
          sourceType: 'git',
          gitUrl: url,
          gitPath: dirPath,
          filePath: skillInfo.dirPath,
        };

        const skill = SkillDB.create(input);
        importedSkills.push(skill);
      } catch (error) {
        errors.push({
          path: dirPath,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        imported: importedSkills,
        errors: errors,
        totalImported: importedSkills.length,
        totalErrors: errors.length,
      },
    });
  } catch (error) {
    console.error('Error importing from git:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to import from git repository' },
      { status: 500 }
    );
  }
}
