import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { CommandBar } from '../../components/CommandBar';

interface CounselorLayoutProps {
  children?: React.ReactNode;
}

export function CounselorLayout({ children }: CounselorLayoutProps) {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark', !isDark);
  };

  return (
    <div
      className={`min-h-screen ${
        isDark
          ? 'bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900/10 text-slate-200'
          : 'bg-(--role-counselor-bg) text-(--role-counselor-text)'
      }`}
    >
      <CommandBar isDark={isDark} onToggleTheme={toggleTheme} />
      <main>{children || <Outlet />}</main>
    </div>
  );
}
