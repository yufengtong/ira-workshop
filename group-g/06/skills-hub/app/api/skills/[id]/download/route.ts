import { NextRequest, NextResponse } from 'next/server';
import { SkillDB } from '@/lib/db';
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

    if (!skill.filePath) {
      return NextResponse.json(
        { success: false, error: 'Skill has no associated files' },
        { status: 404 }
      );
    }

    const zipBuffer = await GitHelper.createZipFromSkillDir(skill.filePath);

    if (!zipBuffer) {
      return NextResponse.json(
        { success: false, error: 'Failed to create ZIP file' },
        { status: 500 }
      );
    }

    const fileName = `${skill.filePath}.zip`;

    return new NextResponse(new Uint8Array(zipBuffer), {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(fileName)}"`,
        'Content-Length': zipBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Error downloading skill:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to download skill' },
      { status: 500 }
    );
  }
}
