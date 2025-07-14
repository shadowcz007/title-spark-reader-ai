import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';

const NotFound = () => {
  const location = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-emerald-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        {/* 主卡片容器 */}
        <div className="bg-white/70 backdrop-blur-sm shadow-lg rounded-xl p-6">
          {/* 主要内容卡片 */}
          <div className="bg-white shadow-xl rounded-2xl p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h1 className="text-[#121416] text-[32px] font-bold leading-tight mb-2">404</h1>
            <p className="text-[#6a7681] text-base font-normal leading-normal mb-6">
              {t('pageNotFound')}
            </p>
            <Link to="/">
              <Button className="bg-[#0c7ff2] hover:bg-[#0a6fd8] text-white font-semibold py-2 px-6 rounded-lg flex items-center gap-2 mx-auto transition-colors">
                <Home className="h-4 w-4" />
                <span>{t('backToHome')}</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
