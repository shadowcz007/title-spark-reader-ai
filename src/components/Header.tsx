import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Settings as SettingsIcon, HelpCircle, Globe } from 'lucide-react';
import { Button } from '@/ui';
import { useTranslation } from 'react-i18next';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';

interface HeaderProps {
  currentPage?: 'simulate' | 'readers' | 'settings' | 'simulations' | 'feedback' | 'templates' | 'team' | 'help' | 'news';
  onSettingsClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentPage, onSettingsClick }) => {
  const { t, i18n } = useTranslation();
  // const navigate = useNavigate(); // 如果需要跳转可用
  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#f0f2f5] px-10 py-3 bg-white/60 backdrop-blur-md shadow-sm">
      <div className="flex items-center gap-4 text-[#121416]">
        <div className="size-4">
          <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clipPath="url(#clip0_6_319)">
              <path
                d="M8.57829 8.57829C5.52816 11.6284 3.451 15.5145 2.60947 19.7452C1.76794 23.9758 2.19984 28.361 3.85056 32.3462C5.50128 36.3314 8.29667 39.7376 11.8832 42.134C15.4698 44.5305 19.6865 45.8096 24 45.8096C28.3135 45.8096 32.5302 44.5305 36.1168 42.134C39.7033 39.7375 42.4987 36.3314 44.1494 32.3462C45.8002 28.361 46.2321 23.9758 45.3905 19.7452C44.549 15.5145 42.4718 11.6284 39.4217 8.57829L24 24L8.57829 8.57829Z"
                fill="currentColor"
              ></path>
            </g>
            <defs>
              <clipPath id="clip0_6_319"><rect width="48" height="48" fill="white"></rect></clipPath>
            </defs>
          </svg>
        </div>
        <h2 className="text-[#121416] text-lg font-bold leading-tight tracking-[-0.015em]">{t('title')}</h2>
      </div>
      <div className="flex flex-1 justify-end gap-8">
        <div className="flex items-center gap-9">
          <Link to="/simulate" className={`text-sm font-medium leading-normal ${currentPage === 'simulate' ? 'text-[#0c7ff2]' : 'text-[#121416]'}`}>{t('simulate')}</Link>
          <Link to="/news" className={`text-sm font-medium leading-normal ${currentPage === 'news' ? 'text-[#0c7ff2]' : 'text-[#121416]'}`}>{t('news')}</Link>
          <Link to="/readers" className={`text-sm font-medium leading-normal ${currentPage === 'readers' ? 'text-[#0c7ff2]' : 'text-[#121416]'}`}>{t('readers')}</Link>
          <button
            type="button"
            className={`text-sm font-medium leading-normal bg-transparent border-0 outline-none cursor-pointer ${currentPage === 'settings' ? 'text-[#0c7ff2]' : 'text-[#121416]'}`}
            onClick={onSettingsClick}
          >
            {t('settings')}
          </button>
        </div>
        <div style={{ position: 'absolute', right: 20, top: 20 }}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label={t('language')}>
                <Globe />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => i18n.changeLanguage('zh')} disabled={i18n.language === 'zh'}>
                {t('chinese')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => i18n.changeLanguage('en')} disabled={i18n.language === 'en'}>
                {t('english')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div
          className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
          style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuC_7pGzkq3D9hpYdig4lhn2AfOiw2-UE5q9kW9Kjo-4qk5ye-wzP1FMV3Kj88amrgJnR7azI1CesO5jmcJynqRMZ_ExRKu79icE-i4mqSTAV10gpVsFHH_lg81iLaxGctQgzdTqFKVrxpy5JP-BvEYD2ikXX-EMNRl7Uhz3iw3VleEbmQsPhp0KbuN9EiVd6LXKVYTOENsXOL_lSTBKmpjjsJlay9yjX7Xe9RObzD-r8uwr-k9lXq0ljrylOWK8sTaoCYZdN0XAiGML")' }}
        ></div>
      </div>
    </header>
  );
};

export default Header; 