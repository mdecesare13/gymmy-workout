import React from 'react';
import { Dumbbell, Sliders, Search, Calendar, MessageSquare } from 'lucide-react';

export default function TabBar({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'today', name: 'Today', icon: Dumbbell },
    { id: 'builder', name: 'Builder', icon: Sliders },
    { id: 'library', name: 'Library', icon: Search },
    { id: 'stats', name: 'Stats', icon: Calendar },
    { id: 'assistant', name: 'Assistant', icon: MessageSquare }
  ];

  return (
    <nav className="ios-tab-bar">
      {tabs.map((tab) => {
        const IconComponent = tab.icon;
        const isActive = activeTab === tab.id;
        
        return (
          <button
            key={tab.id}
            className={`ios-tab-item ${isActive ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            style={{
              background: 'none',
              border: 'none',
              outline: 'none',
              padding: '4px 0'
            }}
          >
            <IconComponent
              className="tab-icon"
              size={22}
              strokeWidth={isActive ? 2.5 : 2}
              color={isActive ? 'var(--gym-red)' : 'var(--shark-500)'}
            />
            <span style={{
              color: isActive ? 'var(--gym-red)' : 'var(--shark-500)',
              fontWeight: isActive ? '600' : '500'
            }}>
              {tab.name}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
