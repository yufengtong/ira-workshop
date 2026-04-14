'use client';

import React, { useState, useEffect } from 'react';
import { List, Button, Space, Tag, Input, Select, Card, message, Popconfirm, Typography, Empty } from 'antd';
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, ImportOutlined, FileTextOutlined } from '@ant-design/icons';

const { Text, Paragraph } = Typography;

interface Skill {
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
  skillFiles?: string[];
  createdAt: string;
  updatedAt: string;
}

interface SkillListProps {
  onEdit?: (skill: Skill) => void;
  onView?: (skill: Skill) => void;
  onAdd?: () => void;
  onGitImport?: () => void;
}

export default function SkillList({ onEdit, onView, onAdd, onGitImport }: SkillListProps) {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState<string>('');
  const [categories, setCategories] = useState<string[]>([]);

  const fetchSkills = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (keyword) params.append('keyword', keyword);
      if (category) params.append('category', category);
      
      const res = await fetch(`/api/skills?${params.toString()}`);
      const data = await res.json();
      
      if (data.success) {
        setSkills(data.data);
      }
    } catch (error) {
      message.error('获取技能列表失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/skills/categories');
      const data = await res.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch categories');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/skills/${id}`, { method: 'DELETE' });
      const data = await res.json();
      
      if (data.success) {
        message.success('删除成功');
        fetchSkills();
      } else {
        message.error(data.error || '删除失败');
      }
    } catch (error) {
      message.error('删除失败');
    }
  };

  useEffect(() => {
    fetchSkills();
    fetchCategories();
  }, []);

  const getTags = (tagsStr: string | null): string[] => {
    if (!tagsStr) return [];
    try {
      return JSON.parse(tagsStr);
    } catch {
      return [];
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-4 flex-wrap">
          <Input
            placeholder="搜索技能..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onPressEnter={fetchSkills}
            prefix={<SearchOutlined />}
            style={{ width: 250 }}
          />
          <Select
            placeholder="选择分类"
            value={category || undefined}
            onChange={setCategory}
            allowClear
            style={{ width: 150 }}
            options={categories.map(c => ({ label: c, value: c }))}
          />
          <Button type="primary" onClick={fetchSkills}>
            搜索
          </Button>
        </div>
        <div className="flex gap-2">
          <Button icon={<ImportOutlined />} onClick={onGitImport}>
            从 Git 导入
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={onAdd}>
            添加技能
          </Button>
        </div>
      </div>

      <List
        grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 2, xl: 3, xxl: 3 }}
        dataSource={skills}
        loading={loading}
        locale={{ emptyText: <Empty description="暂无技能" /> }}
        pagination={{ 
          pageSize: 9,
          showTotal: (total) => `共 ${total} 个技能`,
        }}
        renderItem={(skill) => {
          const tags = getTags(skill.tags);
          return (
            <List.Item>
              <Card
                hoverable
                className="h-full"
                onClick={() => onView?.(skill)}
                title={
                  <div className="flex items-center justify-between">
                    <Text strong className="text-lg">{skill.name}</Text>
                    <Tag color={skill.sourceType === 'git' ? 'purple' : 'orange'}>
                      {skill.sourceType === 'git' ? 'Git' : '手动'}
                    </Tag>
                  </div>
                }
                actions={[
                  <Button 
                    key="view"
                    type="text" 
                    icon={<EyeOutlined />} 
                    onClick={(e) => {
                      e.stopPropagation();
                      onView?.(skill);
                    }}
                  >
                    查看
                  </Button>,
                  <Button 
                    key="edit"
                    type="text" 
                    icon={<EditOutlined />} 
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit?.(skill);
                    }}
                  >
                    编辑
                  </Button>,
                  <Popconfirm
                    key="delete"
                    title="删除技能"
                    description="确定要删除这个技能吗？"
                    onConfirm={(e) => {
                      e?.stopPropagation();
                      handleDelete(skill.id);
                    }}
                    onCancel={(e) => e?.stopPropagation()}
                    okText="确定"
                    cancelText="取消"
                  >
                    <Button 
                      type="text" 
                      danger 
                      icon={<DeleteOutlined />}
                      onClick={(e) => e.stopPropagation()}
                    >
                      删除
                    </Button>
                  </Popconfirm>,
                ]}
              >
                <div className="space-y-2">
                  {skill.category && (
                    <div>
                      <Tag color="blue">{skill.category}</Tag>
                    </div>
                  )}
                  
                  {skill.description ? (
                    <Paragraph 
                      ellipsis={{ rows: 2 }} 
                      className="text-gray-600 mb-2"
                    >
                      {skill.description}
                    </Paragraph>
                  ) : (
                    <Paragraph className="text-gray-400 mb-2">
                      暂无描述
                    </Paragraph>
                  )}

                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>版本: <Tag color="green">{skill.version}</Tag></span>
                    <span>使用: {skill.usageCount} 次</span>
                  </div>

                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {tags.slice(0, 3).map((tag: string) => (
                        <Tag key={tag} color="cyan">{tag}</Tag>
                      ))}
                      {tags.length > 3 && (
                        <Tag>+{tags.length - 3}</Tag>
                      )}
                    </div>
                  )}

                  <div className="text-xs text-gray-400 mt-2">
                    更新于: {new Date(skill.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              </Card>
            </List.Item>
          );
        }}
      />
    </div>
  );
}
