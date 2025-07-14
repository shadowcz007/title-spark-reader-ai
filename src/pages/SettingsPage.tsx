import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Settings from '@/components/Settings';
import { useTranslation } from 'react-i18next';

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSettingsClick = () => {
    navigate('/settings');
  };

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-white group/design-root overflow-x-hidden" style={{ fontFamily: 'Newsreader, "Noto Sans", sans-serif' }}>
      <Header currentPage="settings" onSettingsClick={handleSettingsClick} />
      <div className="layout-container flex h-full grow flex-col">
        <Settings />
      </div>
    </div>
  );
};

export default SettingsPage; 