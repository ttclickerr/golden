import { useTranslation } from 'react-i18next';
import { Github, Heart } from 'lucide-react';
import { VersionInfo } from '@/components/VersionInfo';

const Footer = () => {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-muted/50">
      <div className="container flex flex-col sm:flex-row items-center justify-between py-4 text-sm text-muted-foreground">
        <div className="flex items-center mb-2 sm:mb-0 gap-2">
          <Heart className="h-4 w-4 mr-1 text-red-500" />
          <span>© {year} {t('app.title')}</span>
          <VersionInfo />
        </div>
        
        <div className="flex items-center gap-4">
          <a
            href="#"
            className="hover:text-foreground"
            rel="noopener noreferrer"
          >
            {t('footer.termsOfService')}
          </a>
          <a
            href="#"
            className="hover:text-foreground"
            rel="noopener noreferrer"
          >
            {t('footer.privacyPolicy')}
          </a>
          <a
            href="https://github.com"
            className="hover:text-foreground flex items-center"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Github className="h-4 w-4 mr-1" />
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;