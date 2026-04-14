'use client';

import React, { useState } from 'react';
import { Modal, Form, Input, Button, message, Select, List, Checkbox, Tag, Typography, Space, Collapse } from 'antd';
import { GithubOutlined, FolderOutlined, FileTextOutlined, CheckCircleOutlined } from '@ant-design/icons';

const { Text, Paragraph } = Typography;

interface SkillInfo {
  dirPath: string;
  name: string;
  description: string;
  author: string;
  version: string;
  tags: string[];
  license: string;
  files: string[];
  structureType: 'minimal' | 'advanced';
}

interface GitImportFormProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

export default function GitImportForm({ visible, onCancel, onSuccess }: GitImportFormProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [skills, setSkills] = useState<SkillInfo[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [parsed, setParsed] = useState(false);

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

  const handleParse = async () => {
    try {
      const values = await form.validateFields(['url', 'branch']);
      setParsing(true);

      const res = await fetch('/api/git/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: values.url,
          branch: values.branch || 'main',
        }),
      });

      const data = await res.json();

      if (data.success) {
        setSkills(data.data.skills);
        setParsed(true);
        fetchCategories();
        if (data.data.skills.length === 0) {
          message.warning('仓库中未找到符合规范的 Skill（需包含 SKILL.md）');
        } else {
          message.success(`识别到 ${data.data.skills.length} 个 Skill`);
        }
      } else {
        message.error(data.error || '解析仓库失败');
      }
    } catch (error) {
      message.error('解析仓库失败');
    } finally {
      setParsing(false);
    }
  };

  const handleImport = async () => {
    if (selectedSkills.length === 0) {
      message.warning('请至少选择一个 Skill');
      return;
    }

    try {
      const values = await form.validateFields();
      setLoading(true);

      const res = await fetch('/api/git/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: values.url,
          branch: values.branch || 'main',
          skills: selectedSkills,
          category: values.category,
        }),
      });

      const data = await res.json();

      if (data.success) {
        message.success(`成功导入 ${data.data.totalImported} 个 Skill`);
        if (data.data.totalErrors > 0) {
          message.warning(`${data.data.totalErrors} 个 Skill 导入失败`);
        }
        onSuccess();
      } else {
        message.error(data.error || '导入失败');
      }
    } catch (error) {
      message.error('导入失败');
    } finally {
      setLoading(false);
    }
  };

  const toggleSkill = (dirPath: string) => {
    setSelectedSkills((prev) =>
      prev.includes(dirPath)
        ? prev.filter((p) => p !== dirPath)
        : [...prev, dirPath]
    );
  };

  const selectAll = () => {
    if (selectedSkills.length === skills.length) {
      setSelectedSkills([]);
    } else {
      setSelectedSkills(skills.map((s) => s.dirPath));
    }
  };

  const handleReset = () => {
    form.resetFields();
    setSkills([]);
    setSelectedSkills([]);
    setParsed(false);
  };

  const handleCancel = () => {
    handleReset();
    onCancel();
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <GithubOutlined />
          <span>从 Git 导入 Skill</span>
        </div>
      }
      open={visible}
      onCancel={handleCancel}
      width={750}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          取消
        </Button>,
        !parsed ? (
          <Button
            key="parse"
            type="primary"
            onClick={handleParse}
            loading={parsing}
          >
            解析仓库
          </Button>
        ) : (
          <Button
            key="import"
            type="primary"
            onClick={handleImport}
            loading={loading}
            disabled={selectedSkills.length === 0}
          >
            导入 ({selectedSkills.length} 个 Skill)
          </Button>
        ),
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{ branch: 'main' }}
      >
        <Form.Item
          name="url"
          label="Git 仓库地址"
          rules={[{ required: true, message: '请输入 Git 仓库地址' }]}
        >
          <Input
            placeholder="https://github.com/username/repo.git"
            disabled={parsed}
          />
        </Form.Item>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            name="branch"
            label="分支"
            rules={[{ required: true, message: '请输入分支名称' }]}
          >
            <Input placeholder="main" disabled={parsed} />
          </Form.Item>

          {parsed && (
            <Form.Item name="category" label="分类">
              <Select
                placeholder="选择分类"
                allowClear
                showSearch
                options={categories.map((c) => ({ label: c, value: c }))}
              />
            </Form.Item>
          )}
        </div>

        {parsed && (
          <div className="mt-4">
            <div className="flex justify-between items-center mb-3">
              <Space>
                <span className="font-medium">识别到的 Skill</span>
                <Tag color="blue">{skills.length} 个</Tag>
              </Space>
              <Space>
                <Button type="link" size="small" onClick={selectAll}>
                  {selectedSkills.length === skills.length ? '取消全选' : '全选'}
                </Button>
                <Button type="link" size="small" onClick={handleReset}>
                  重置
                </Button>
              </Space>
            </div>

            <div className="border rounded-lg max-h-96 overflow-auto">
              {skills.length > 0 ? (
                <List
                  dataSource={skills}
                  renderItem={(skill) => {
                    const isSelected = selectedSkills.includes(skill.dirPath);
                    return (
                      <List.Item
                        className={`cursor-pointer px-4 transition-colors ${
                          isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
                        }`}
                        onClick={() => toggleSkill(skill.dirPath)}
                      >
                        <div className="flex items-start gap-3 w-full">
                          <Checkbox checked={isSelected} className="mt-1" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <FolderOutlined className="text-yellow-600" />
                              <Text strong>{skill.name}</Text>
                              <Tag color="green">{skill.version}</Tag>
                              <Tag color={skill.structureType === 'advanced' ? 'purple' : 'default'}>
                                {skill.structureType === 'advanced' ? '进阶结构' : '最小结构'}
                              </Tag>
                            </div>
                            {skill.description && (
                              <Paragraph
                                ellipsis={{ rows: 1 }}
                                className="text-gray-500 text-sm mb-1"
                                style={{ marginBottom: 4 }}
                              >
                                {skill.description}
                              </Paragraph>
                            )}
                            <div className="flex items-center gap-3 text-xs text-gray-400">
                              <span>
                                <FolderOutlined /> {skill.dirPath}
                              </span>
                              <span>
                                <FileTextOutlined /> {skill.files.length} 个文件
                              </span>
                              {skill.author && <span>作者: {skill.author}</span>}
                              {skill.license && <span>许可: {skill.license}</span>}
                            </div>
                            {skill.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {skill.tags.map((tag) => (
                                  <Tag key={tag} color="cyan" className="text-xs">
                                    {tag}
                                  </Tag>
                                ))}
                              </div>
                            )}
                          </div>
                          {isSelected && (
                            <CheckCircleOutlined className="text-blue-500 text-lg mt-1" />
                          )}
                        </div>
                      </List.Item>
                    );
                  }}
                />
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <div className="text-lg mb-2">未找到符合规范的 Skill</div>
                  <div className="text-sm">
                    Skill 必须包含 <code className="bg-gray-100 px-1 rounded">SKILL.md</code> 文件
                  </div>
                </div>
              )}
            </div>

            <p className="text-sm text-gray-500 mt-2">
              已选择：{selectedSkills.length} 个 Skill
              {selectedSkills.length > 0 && (
                <span className="ml-2 text-blue-500">
                  (将以文件夹形式保存到 skills/ 目录)
                </span>
              )}
            </p>
          </div>
        )}
      </Form>
    </Modal>
  );
}
