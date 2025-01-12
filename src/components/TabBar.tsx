import { CSSProperties } from 'react';
import { Link, useLocation } from 'react-router-dom';

import Icon, { IconDefinition, Icons } from './Icons';

interface Tab {
    name: string;
    path: string;
    icon: IconDefinition;
    isFlexible?: boolean;
}

const tabs: Tab[] = [
  { name: 'Games', path: '/', icon: Icons.solid.faGamepad, isFlexible: true },
  { name: 'Downloads', path: '/downloads', icon: Icons.solid.faDownload, isFlexible: true },
  { name: 'Devices', path: '/devices', icon: Icons.solid.faTabletAlt, isFlexible: true },
  { name: 'Users', path: '/users', icon: Icons.solid.faUsers, isFlexible: true },
  { name: 'Settings', path: '/settings', icon: Icons.solid.faCog, isFlexible: false },
];

const TabBar: React.FC = () => {
  const location = useLocation();

  return (
    <div style={styles.container}>
      {tabs.map((tab) => (
        <Link
          key={tab.path}
          to={tab.path}
          style={{
            ...styles.tab,
            ...(tab.isFlexible ? styles.flexibleTab : styles.nonFlexibleTab),
            ...(location.pathname === tab.path ? styles.activeTab : {}),
          }}
        >
          <Icon icon={tab.icon} size="lg" />
          <span style={styles.tabText}>{tab.name}</span>
        </Link>
      ))}
    </div>
  );
};

const styles: { [key: string]: CSSProperties } = {
  container: {
    display: 'flex',
    flexDirection: 'row',
    height: '60px',
    backgroundColor: '#2c3e50',
    borderTop: '1px solid #34495e',
  },
  tab: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textDecoration: 'none',
    color: '#ecf0f1',
  },
  flexibleTab: {
    flex: 1,
  },
  nonFlexibleTab: {
    flex: 'none',
    width: '80px',
  },
  activeTab: {
    backgroundColor: '#34495e',
  },
  tabText: {
    fontSize: '12px',
    marginTop: '4px',
  },
};

export default TabBar;