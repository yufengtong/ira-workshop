import simpleGit, { SimpleGit } from 'simple-git';
import path from 'path';
import fs from 'fs';
import os from 'os';
import matter from 'gray-matter';
import JSZip from 'jszip';

const TEMP_DIR = path.join(os.tmpdir(), 'skills-platform-git');
const SKILLS_DIR = path.join(process.cwd(), 'skills');

/**
 * Skill 标准目录结构中 SKILL.md 的 frontmatter 元数据
 */
export interface SkillMetadata {
  name: string;
  description?: string;
  license?: string;
  metadata?: {
    author?: string;
    version?: string;
    tags?: string[];
    [key: string]: any;
  };
  [key: string]: any;
}

/**
 * 解析后的 Skill 信息（从包含 SKILL.md 的目录中识别）
 */
export interface SkillDirInfo {
  /** skill 目录相对路径（相对于仓库根） */
  dirPath: string;
  /** skill 名称（来自 frontmatter 或目录名） */
  name: string;
  /** 描述（来自 frontmatter） */
  description: string;
  /** 作者 */
  author: string;
  /** 版本 */
  version: string;
  /** 标签 */
  tags: string[];
  /** 许可证 */
  license: string;
  /** SKILL.md 的完整内容（含 frontmatter） */
  skillMdContent: string;
  /** SKILL.md 的正文（不含 frontmatter） */
  skillMdBody: string;
  /** skill 目录下的文件列表（相对于 skill 目录） */
  files: string[];
  /** 目录结构类型：minimal | advanced */
  structureType: 'minimal' | 'advanced';
}

/**
 * 仓库解析结果
 */
export interface GitRepoSkillsInfo {
  url: string;
  skills: SkillDirInfo[];
}

export class GitHelper {
  private static async ensureTempDir(): Promise<string> {
    if (!fs.existsSync(TEMP_DIR)) {
      fs.mkdirSync(TEMP_DIR, { recursive: true });
    }
    return TEMP_DIR;
  }

  private static getRepoDirName(url: string): string {
    const hash = Buffer.from(url).toString('base64').replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
    return `repo_${hash}`;
  }

  static async cloneOrPull(url: string, branch?: string): Promise<string> {
    const tempDir = await GitHelper.ensureTempDir();
    const repoDir = path.join(tempDir, GitHelper.getRepoDirName(url));

    const git: SimpleGit = simpleGit();

    if (fs.existsSync(repoDir)) {
      const repoGit = simpleGit(repoDir);
      await repoGit.pull('origin', branch || 'main');
    } else {
      await git.clone(url, repoDir, ['--depth', '1', '--branch', branch || 'main']);
    }

    return repoDir;
  }

  /**
   * 从 Git URL 提取仓库名称
   */
  private static getRepoName(url: string): string {
    const match = url.match(/\/([^\/]+?)(\.git)?$/);
    return match ? match[1] : 'unknown-repo';
  }

  /**
   * 解析 SKILL.md 的 YAML frontmatter
   */
  static parseSkillMd(content: string): { metadata: SkillMetadata; body: string } {
    try {
      const parsed = matter(content);
      const data = parsed.data as SkillMetadata;
      return {
        metadata: {
          ...data,
          name: data.name || '',
          description: data.description || '',
          license: data.license || '',
          metadata: data.metadata || {},
        },
        body: parsed.content,
      };
    } catch (e) {
      return {
        metadata: { name: '' },
        body: content,
      };
    }
  }

  /**
   * 递归列出目录下所有文件（相对路径）
   */
  private static listFilesRecursive(dir: string, baseDir: string): string[] {
    const results: string[] = [];
    if (!fs.existsSync(dir)) return results;

    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
      if (entry.isDirectory() && entry.name !== '.git') {
        results.push(...GitHelper.listFilesRecursive(fullPath, baseDir));
      } else if (entry.isFile()) {
        results.push(relativePath);
      }
    }
    return results;
  }

  /**
   * 扫描仓库中的 Skill 目录（包含 SKILL.md 的文件夹）
   */
  static async scanSkills(url: string, branch?: string): Promise<GitRepoSkillsInfo> {
    const repoDir = await GitHelper.cloneOrPull(url, branch);
    const skills: SkillDirInfo[] = [];

    const scanDir = (dir: string) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      // 检查当前目录是否包含 SKILL.md
      const hasSkillMd = entries.some(
        (e) => e.isFile() && e.name === 'SKILL.md'
      );

      if (hasSkillMd) {
        const skillMdPath = path.join(dir, 'SKILL.md');
        const skillMdContent = fs.readFileSync(skillMdPath, 'utf-8');
        const { metadata, body } = GitHelper.parseSkillMd(skillMdContent);
        const dirRelPath = path.relative(repoDir, dir).replace(/\\/g, '/') || '.';

        // 列出 skill 目录下的所有文件
        const files = GitHelper.listFilesRecursive(dir, dir);

        // 判断结构类型
        const advancedDirs = ['scripts', 'references', 'templates', 'assets'];
        const hasAdvancedDirs = entries.some(
          (e) => e.isDirectory() && advancedDirs.includes(e.name)
        );

        const dirName = path.basename(dir);

        skills.push({
          dirPath: dirRelPath,
          name: metadata.name || dirName,
          description: metadata.description || '',
          author: metadata.metadata?.author || '',
          version: metadata.metadata?.version || '1.0.0',
          tags: metadata.metadata?.tags || [],
          license: metadata.license || '',
          skillMdContent,
          skillMdBody: body,
          files,
          structureType: hasAdvancedDirs ? 'advanced' : 'minimal',
        });

        // 找到 SKILL.md 后，不再递归子目录（一个 skill 目录是一个整体）
        return;
      }

      // 继续递归查找子目录
      for (const entry of entries) {
        if (entry.isDirectory() && entry.name !== '.git' && entry.name !== 'node_modules') {
          scanDir(path.join(dir, entry.name));
        }
      }
    };

    scanDir(repoDir);

    return { url, skills };
  }

  /**
   * 递归拷贝目录
   */
  private static copyDirRecursive(src: string, dest: string): void {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }

    const entries = fs.readdirSync(src, { withFileTypes: true });
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      if (entry.isDirectory() && entry.name !== '.git') {
        GitHelper.copyDirRecursive(srcPath, destPath);
      } else if (entry.isFile()) {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }

  /**
   * 将整个 skill 目录导入到本地 skills/ 目录
   * 保持原有目录结构: skills/{skill-dir-name}/
   */
  static async importSkillDir(
    gitUrl: string,
    skillDirPath: string,
    branch?: string
  ): Promise<SkillDirInfo | null> {
    const repoDir = await GitHelper.cloneOrPull(gitUrl, branch);

    // 源目录
    const srcDir = skillDirPath === '.'
      ? repoDir
      : path.join(repoDir, skillDirPath);

    if (!fs.existsSync(srcDir)) return null;

    // 检查 SKILL.md 是否存在
    const skillMdPath = path.join(srcDir, 'SKILL.md');
    if (!fs.existsSync(skillMdPath)) return null;

    // 读取并解析 SKILL.md
    const skillMdContent = fs.readFileSync(skillMdPath, 'utf-8');
    const { metadata, body } = GitHelper.parseSkillMd(skillMdContent);

    const dirName = path.basename(srcDir === repoDir ? repoDir : srcDir);
    const skillName = metadata.name || dirName;

    // 目标目录: skills/{dirName}
    const skillsDir = GitHelper.getSkillsDir();
    const destDir = path.join(skillsDir, dirName);

    // 拷贝整个目录
    GitHelper.copyDirRecursive(srcDir, destDir);

    // 列出文件
    const files = GitHelper.listFilesRecursive(destDir, destDir);

    const advancedDirs = ['scripts', 'references', 'templates', 'assets'];
    const entries = fs.readdirSync(destDir, { withFileTypes: true });
    const hasAdvancedDirs = entries.some(
      (e) => e.isDirectory() && advancedDirs.includes(e.name)
    );

    return {
      dirPath: dirName,
      name: skillName,
      description: metadata.description || '',
      author: metadata.metadata?.author || '',
      version: metadata.metadata?.version || '1.0.0',
      tags: metadata.metadata?.tags || [],
      license: metadata.license || '',
      skillMdContent,
      skillMdBody: body,
      files,
      structureType: hasAdvancedDirs ? 'advanced' : 'minimal',
    };
  }

  /**
   * 获取技能目录路径
   */
  static getSkillsDir(): string {
    if (!fs.existsSync(SKILLS_DIR)) {
      fs.mkdirSync(SKILLS_DIR, { recursive: true });
    }
    return SKILLS_DIR;
  }

  /**
   * 从本地技能目录读取 SKILL.md 内容
   * @param skillDirName skill 目录名（相对于 skills/）
   */
  static readSkillFile(skillDirName: string): string | null {
    // 支持旧格式（直接文件路径）和新格式（目录名）
    const possiblePaths = [
      path.join(SKILLS_DIR, skillDirName, 'SKILL.md'),
      path.join(SKILLS_DIR, skillDirName),
    ];

    for (const fullPath of possiblePaths) {
      if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
        return fs.readFileSync(fullPath, 'utf-8');
      }
    }
    return null;
  }

  /**
   * 获取 skill 目录下的文件列表
   */
  static getSkillFiles(skillDirName: string): string[] {
    const skillDir = path.join(SKILLS_DIR, skillDirName);
    if (!fs.existsSync(skillDir) || !fs.statSync(skillDir).isDirectory()) {
      return [];
    }
    return GitHelper.listFilesRecursive(skillDir, skillDir);
  }

  /**
   * 删除本地技能目录
   */
  static deleteSkillDir(skillDirName: string): boolean {
    const fullPath = path.join(SKILLS_DIR, skillDirName);
    if (fs.existsSync(fullPath)) {
      if (fs.statSync(fullPath).isDirectory()) {
        fs.rmSync(fullPath, { recursive: true, force: true });
      } else {
        fs.unlinkSync(fullPath);
      }
      return true;
    }
    return false;
  }

  /**
   * 生成标准 SKILL.md 内容（含 YAML frontmatter）
   */
  static generateSkillMd(params: {
    name: string;
    description?: string;
    author?: string;
    version?: string;
    tags?: string[];
    license?: string;
    body?: string;
  }): string {
    const frontmatter: Record<string, any> = {
      name: params.name,
    };
    if (params.description) frontmatter.description = params.description;
    if (params.license) frontmatter.license = params.license;

    const meta: Record<string, any> = {};
    if (params.author) meta.author = params.author;
    if (params.version) meta.version = params.version;
    if (params.tags && params.tags.length > 0) meta.tags = params.tags;
    if (Object.keys(meta).length > 0) frontmatter.metadata = meta;

    return matter.stringify(params.body || '', frontmatter);
  }

  /**
   * 手动创建 Skill 目录（遵循标准结构）
   * 在 skills/{dirName}/ 下创建 SKILL.md
   */
  static createSkillDir(params: {
    name: string;
    description?: string;
    author?: string;
    version?: string;
    tags?: string[];
    license?: string;
    body?: string;
  }): { dirName: string; files: string[] } {
    const dirName = params.name.replace(/[^a-zA-Z0-9\u4e00-\u9fa5_-]/g, '_').toLowerCase();
    const skillsDir = GitHelper.getSkillsDir();
    const skillDir = path.join(skillsDir, dirName);

    if (!fs.existsSync(skillDir)) {
      fs.mkdirSync(skillDir, { recursive: true });
    }

    // 生成并写入 SKILL.md
    const skillMdContent = GitHelper.generateSkillMd(params);
    fs.writeFileSync(path.join(skillDir, 'SKILL.md'), skillMdContent, 'utf-8');

    const files = GitHelper.listFilesRecursive(skillDir, skillDir);
    return { dirName, files };
  }

  /**
   * 更新已有 Skill 目录的 SKILL.md（同步元数据变更）
   */
  static updateSkillMd(skillDirName: string, params: {
    name?: string;
    description?: string;
    author?: string;
    version?: string;
    tags?: string[];
    license?: string;
    body?: string;
  }): void {
    const skillMdPath = path.join(SKILLS_DIR, skillDirName, 'SKILL.md');

    let existingMeta: SkillMetadata = { name: '' };
    let existingBody = '';

    // 读取现有内容
    if (fs.existsSync(skillMdPath)) {
      const content = fs.readFileSync(skillMdPath, 'utf-8');
      const parsed = GitHelper.parseSkillMd(content);
      existingMeta = parsed.metadata;
      existingBody = parsed.body;
    }

    // 合并更新
    const newContent = GitHelper.generateSkillMd({
      name: params.name ?? existingMeta.name,
      description: params.description ?? existingMeta.description,
      author: params.author ?? existingMeta.metadata?.author,
      version: params.version ?? existingMeta.metadata?.version,
      tags: params.tags ?? existingMeta.metadata?.tags,
      license: params.license ?? existingMeta.license,
      body: params.body ?? existingBody,
    });

    // 确保目录存在
    const dir = path.dirname(skillMdPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(skillMdPath, newContent, 'utf-8');
  }

  /**
   * 从 ZIP Buffer 解压并创建/更新 Skill 目录
   * ZIP 内应包含 SKILL.md
   */
  static async extractZipToSkillDir(
    zipBuffer: Buffer,
    targetDirName?: string
  ): Promise<{ dirName: string; skillInfo: SkillDirInfo } | null> {
    const zip = await JSZip.loadAsync(zipBuffer);

    // 查找 SKILL.md（可能在根目录或在子目录中）
    let skillMdPath: string | null = null;
    let rootPrefix = '';

    for (const fileName of Object.keys(zip.files)) {
      const normalizedName = fileName.replace(/\\/g, '/');
      if (normalizedName.endsWith('SKILL.md') || normalizedName === 'SKILL.md') {
        const parts = normalizedName.split('/');
        if (parts.length === 1) {
          // SKILL.md 在根目录
          skillMdPath = normalizedName;
          rootPrefix = '';
        } else if (parts.length === 2) {
          // SKILL.md 在一级子目录中
          skillMdPath = normalizedName;
          rootPrefix = parts[0] + '/';
        }
        break;
      }
    }

    if (!skillMdPath) return null;

    // 读取 SKILL.md 内容
    const skillMdFile = zip.file(skillMdPath);
    if (!skillMdFile) return null;
    const skillMdContent = await skillMdFile.async('text');
    const { metadata, body } = GitHelper.parseSkillMd(skillMdContent);

    // 确定目录名
    let dirName = targetDirName;
    if (!dirName) {
      if (rootPrefix) {
        dirName = rootPrefix.replace(/\/$/, '');
      } else {
        dirName = (metadata.name || 'imported-skill').replace(/[^a-zA-Z0-9\u4e00-\u9fa5_-]/g, '_').toLowerCase();
      }
    }

    const skillsDir = GitHelper.getSkillsDir();
    const destDir = path.join(skillsDir, dirName);

    // 清空已有目录
    if (fs.existsSync(destDir)) {
      fs.rmSync(destDir, { recursive: true, force: true });
    }
    fs.mkdirSync(destDir, { recursive: true });

    // 解压所有文件
    for (const [fileName, file] of Object.entries(zip.files)) {
      if (file.dir) continue;

      // 去除根目录前缀
      let relativePath = fileName.replace(/\\/g, '/');
      if (rootPrefix && relativePath.startsWith(rootPrefix)) {
        relativePath = relativePath.substring(rootPrefix.length);
      }
      if (!relativePath) continue;

      const destPath = path.join(destDir, relativePath);
      const destFileDir = path.dirname(destPath);

      if (!fs.existsSync(destFileDir)) {
        fs.mkdirSync(destFileDir, { recursive: true });
      }

      const content = await file.async('nodebuffer');
      fs.writeFileSync(destPath, content);
    }

    // 构建返回信息
    const files = GitHelper.listFilesRecursive(destDir, destDir);
    const entries = fs.readdirSync(destDir, { withFileTypes: true });
    const advancedDirs = ['scripts', 'references', 'templates', 'assets'];
    const hasAdvancedDirs = entries.some(
      (e) => e.isDirectory() && advancedDirs.includes(e.name)
    );

    return {
      dirName,
      skillInfo: {
        dirPath: dirName,
        name: metadata.name || dirName,
        description: metadata.description || '',
        author: metadata.metadata?.author || '',
        version: metadata.metadata?.version || '1.0.0',
        tags: metadata.metadata?.tags || [],
        license: metadata.license || '',
        skillMdContent,
        skillMdBody: body,
        files,
        structureType: hasAdvancedDirs ? 'advanced' : 'minimal',
      },
    };
  }

  /**
   * 将 Skill 目录打包为 ZIP
   */
  static async createZipFromSkillDir(skillDirName: string): Promise<Buffer | null> {
    const skillDir = path.join(SKILLS_DIR, skillDirName);
    if (!fs.existsSync(skillDir) || !fs.statSync(skillDir).isDirectory()) {
      return null;
    }

    const zip = new JSZip();
    const addFilesToZip = (dir: string, zipFolder: JSZip) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory() && entry.name !== '.git') {
          const subFolder = zipFolder.folder(entry.name)!;
          addFilesToZip(fullPath, subFolder);
        } else if (entry.isFile()) {
          const content = fs.readFileSync(fullPath);
          zipFolder.file(entry.name, content);
        }
      }
    };

    // 在 zip 中创建以 skill 名称命名的根文件夹
    const rootFolder = zip.folder(skillDirName)!;
    addFilesToZip(skillDir, rootFolder);

    return zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' }) as Promise<Buffer>;
  }

  /**
   * 清理临时目录
   */
  static cleanup(): void {
    if (fs.existsSync(TEMP_DIR)) {
      fs.rmSync(TEMP_DIR, { recursive: true, force: true });
    }
  }
}
