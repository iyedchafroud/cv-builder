import { Eye, FileText, FolderOpen, Settings as SettingsIcon } from 'lucide-react';

export function BottomNav({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'forms', label: 'Forms', icon: FileText },
    { id: 'preview', label: 'Preview', icon: Eye },
    { id: 'cvs', label: 'CVs', icon: FolderOpen },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 pb-safe transition-colors z-50">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                isActive ? 'text-green-600 dark:text-green-400' : 'text-slate-500 dark:text-slate-400 hover:text-green-500 dark:hover:text-green-300'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
