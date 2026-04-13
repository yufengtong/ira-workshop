import { NextRequest, NextResponse } from 'next/server';
import { GitHelper } from '@/lib/git';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, branch } = body;

    if (!url) {
      return NextResponse.json(
        { success: false, error: 'Git URL is required' },
        { status: 400 }
      );
    }

    const repoInfo = await GitHelper.scanSkills(url, branch);

    return NextResponse.json({
      success: true,
      data: {
        url: repoInfo.url,
        skills: repoInfo.skills.map((s) => ({
          dirPath: s.dirPath,
          name: s.name,
          description: s.description,
          author: s.author,
          version: s.version,
          tags: s.tags,
          license: s.license,
          files: s.files,
          structureType: s.structureType,
        })),
      },
    });
  } catch (error) {
    console.error('Error parsing git repository:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to parse git repository' },
      { status: 500 }
    );
  }
}
