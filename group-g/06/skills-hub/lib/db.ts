import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'skills.db');

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    initDb();
  }
  return db;
}

function initDb() {
  if (!db) return;
  
  db.exec(`
    CREATE TABLE IF NOT EXISTS Skill (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      content TEXT,
      author TEXT,
      version TEXT DEFAULT '1.0.0',
      tags TEXT,
      category TEXT,
      usageCount INTEGER DEFAULT 0,
      sourceType TEXT DEFAULT 'manual',
      gitUrl TEXT,
      gitPath TEXT,
      filePath TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_skill_name ON Skill(name);
    CREATE INDEX IF NOT EXISTS idx_skill_category ON Skill(category);
    CREATE INDEX IF NOT EXISTS idx_skill_source ON Skill(sourceType);
  `);

  // 迁移：确保 content 字段可以为 NULL（移除可能存在的 NOT NULL 约束）
  try {
    // 检查 content 是否有 NOT NULL 约束
    const tableInfo = db.pragma("table_info('Skill')") as Array<{name: string, notnull: number}>;
    const contentColumn = tableInfo.find(col => col.name === 'content');
    if (contentColumn && contentColumn.notnull === 1) {
      // 如果有 NOT NULL 约束，需要重建表
      db.exec(`
        PRAGMA foreign_keys=off;
        BEGIN TRANSACTION;
        ALTER TABLE Skill RENAME TO Skill_old;
        CREATE TABLE Skill (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          description TEXT,
          content TEXT,
          author TEXT,
          version TEXT DEFAULT '1.0.0',
          tags TEXT,
          category TEXT,
          usageCount INTEGER DEFAULT 0,
          sourceType TEXT DEFAULT 'manual',
          gitUrl TEXT,
          gitPath TEXT,
          filePath TEXT,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        INSERT INTO Skill SELECT * FROM Skill_old;
        DROP TABLE Skill_old;
        COMMIT;
        PRAGMA foreign_keys=on;
      `);
    }
  } catch (e) {
    console.error('Migration error:', e);
  }

  // 迁移：为已存在的表添加 filePath 列（如果不存在）
  try {
    db.exec('ALTER TABLE Skill ADD COLUMN filePath TEXT');
  } catch (e) {
    // 列已存在，忽略错误
  }
}

export interface Skill {
  id: number;
  name: string;
  description: string | null;
  content: string | null;
  author: string | null;
  version: string;
  tags: string | null;
  category: string | null;
  usageCount: number;
  sourceType: string;
  gitUrl: string | null;
  gitPath: string | null;
  filePath: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSkillInput {
  name: string;
  description?: string;
  content?: string;
  author?: string;
  version?: string;
  tags?: string[];
  category?: string;
  sourceType?: string;
  gitUrl?: string;
  gitPath?: string;
  filePath?: string;
}

export interface UpdateSkillInput {
  name?: string;
  description?: string;
  content?: string;
  author?: string;
  version?: string;
  tags?: string[];
  category?: string;
}

export const SkillDB = {
  getAll: (limit = 100, offset = 0): Skill[] => {
    const db = getDb();
    return db
      .prepare('SELECT * FROM Skill ORDER BY updatedAt DESC LIMIT ? OFFSET ?')
      .all(limit, offset) as Skill[];
  },

  getById: (id: number): Skill | null => {
    const db = getDb();
    return db.prepare('SELECT * FROM Skill WHERE id = ?').get(id) as Skill | null;
  },

  create: (input: CreateSkillInput): Skill => {
    const db = getDb();
    const result = db
      .prepare(
        `INSERT INTO Skill (name, description, content, author, version, tags, category, sourceType, gitUrl, gitPath, filePath)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        input.name,
        input.description || null,
        input.content || null,
        input.author || null,
        input.version || '1.0.0',
        input.tags ? JSON.stringify(input.tags) : null,
        input.category || null,
        input.sourceType || 'manual',
        input.gitUrl || null,
        input.gitPath || null,
        input.filePath || null
      );
      
    return SkillDB.getById(result.lastInsertRowid as number)!;
  },

  update: (id: number, input: UpdateSkillInput): Skill | null => {
    const db = getDb();
    const sets: string[] = [];
    const values: any[] = [];

    if (input.name !== undefined) {
      sets.push('name = ?');
      values.push(input.name);
    }
    if (input.description !== undefined) {
      sets.push('description = ?');
      values.push(input.description);
    }
    if (input.content !== undefined) {
      sets.push('content = ?');
      values.push(input.content);
    }
    if (input.author !== undefined) {
      sets.push('author = ?');
      values.push(input.author);
    }
    if (input.version !== undefined) {
      sets.push('version = ?');
      values.push(input.version);
    }
    if (input.tags !== undefined) {
      sets.push('tags = ?');
      values.push(JSON.stringify(input.tags));
    }
    if (input.category !== undefined) {
      sets.push('category = ?');
      values.push(input.category);
    }

    if (sets.length === 0) return SkillDB.getById(id);

    sets.push('updatedAt = CURRENT_TIMESTAMP');
    values.push(id);

    db.prepare(`UPDATE Skill SET ${sets.join(', ')} WHERE id = ?`).run(...values);
    return SkillDB.getById(id);
  },

  delete: (id: number): boolean => {
    const db = getDb();
    const result = db.prepare('DELETE FROM Skill WHERE id = ?').run(id);
    return result.changes > 0;
  },

  search: (keyword: string, category?: string): Skill[] => {
    const db = getDb();
    let sql = 'SELECT * FROM Skill WHERE (name LIKE ? OR description LIKE ? OR content LIKE ?)';
    const params: any[] = [`%${keyword}%`, `%${keyword}%`, `%${keyword}%`];

    if (category) {
      sql += ' AND category = ?';
      params.push(category);
    }

    sql += ' ORDER BY updatedAt DESC';
    return db.prepare(sql).all(...params) as Skill[];
  },

  getCategories: (): string[] => {
    const db = getDb();
    const rows = db.prepare('SELECT DISTINCT category FROM Skill WHERE category IS NOT NULL').all() as { category: string }[];
    return rows.map(r => r.category);
  },

  incrementUsage: (id: number): void => {
    const db = getDb();
    db.prepare('UPDATE Skill SET usageCount = usageCount + 1 WHERE id = ?').run(id);
  },
};
