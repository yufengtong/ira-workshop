'use client';

import { useState } from 'react';
import { Layout, Typography } from 'antd';
import SkillList from '@/components/SkillList';
import SkillForm from '@/components/SkillForm';
import SkillDetail from '@/components/SkillDetail';
import GitImportForm from '@/components/GitImportForm';

const { Header, Content } = Layout;
const { Title } = Typography;

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

export default function Home() {
  const [formVisible, setFormVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [gitImportVisible, setGitImportVisible] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleAdd = () => {
    setSelectedSkill(null);
    setFormVisible(true);
  };

  const handleEdit = (skill: Skill) => {
    setSelectedSkill(skill);
    setFormVisible(true);
  };

  const handleView = (skill: Skill) => {
    setSelectedSkill(skill);
    setDetailVisible(true);
  };

  const handleGitImport = () => {
    setGitImportVisible(true);
  };

  const handleFormSuccess = () => {
    setFormVisible(false);
    setRefreshKey(prev => prev + 1);
  };

  const handleGitImportSuccess = () => {
    setGitImportVisible(false);
    setRefreshKey(prev => prev + 1);
  };

  return (
    <Layout className="min-h-screen">
      <Header className="bg-slate-800 flex items-center px-6">
        <Title level={3} className="m-0 !text-white">Skills 管理平台</Title>
      </Header>
      <Content className="p-6">
        <div className="max-w-7xl mx-auto">
          <SkillList
            key={refreshKey}
            onAdd={handleAdd}
            onEdit={handleEdit}
            onView={handleView}
            onGitImport={handleGitImport}
          />
        </div>
      </Content>

      <SkillForm
        visible={formVisible}
        skill={selectedSkill}
        onCancel={() => setFormVisible(false)}
        onSuccess={handleFormSuccess}
      />

      <SkillDetail
        visible={detailVisible}
        skill={selectedSkill}
        onClose={() => setDetailVisible(false)}
        onEdit={handleEdit}
      />

      <GitImportForm
        visible={gitImportVisible}
        onCancel={() => setGitImportVisible(false)}
        onSuccess={handleGitImportSuccess}
      />
    </Layout>
  );
}
