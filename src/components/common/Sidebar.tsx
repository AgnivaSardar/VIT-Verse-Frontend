import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaBolt, FaLayerGroup, FaCode, FaMicrochip, FaFlask, FaMusic, FaTrophy } from 'react-icons/fa';
import '../../styles/sidebar.css';

interface NavLink {
  path: string;
  label: string;
  icon: React.ReactNode;
}

const mainNav: NavLink[] = [
  { path: '/', label: 'Home', icon: <FaHome /> },
  { path: '/trending', label: 'Trending at VITC', icon: <FaBolt /> },
  { path: '/subscriptions', label: 'Subscriptions', icon: <FaLayerGroup /> },
];

const departmentsNav: NavLink[] = [
  { path: '/department/scope', label: 'SCOPE', icon: <FaCode /> },
  { path: '/department/sense', label: 'SENSE', icon: <FaMicrochip /> },
  { path: '/department/sas', label: 'SAS', icon: <FaFlask /> },
];

const campusLifeNav: NavLink[] = [
  { path: '/event/vibrance', label: 'Vibrance 2024', icon: <FaMusic /> },
  { path: '/event/sports', label: 'Sports (VDP)', icon: <FaTrophy /> },
];

const Sidebar: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const renderNavLinks = (links: NavLink[]) =>
    links.map((link) => (
      <Link
        key={link.path}
        to={link.path}
        className={`nav-link ${isActive(link.path) ? 'active' : ''}`}
      >
        {link.icon}
        <span>{link.label}</span>
      </Link>
    ));

  return (
    <aside>
      {renderNavLinks(mainNav)}
      <hr style={{ margin: '15px 0', border: 0, borderTop: '1px solid #eee' }} />
      <p className="section-title">Departments</p>
      {renderNavLinks(departmentsNav)}
      <p className="section-title">Campus Life</p>
      {renderNavLinks(campusLifeNav)}
    </aside>
  );
};

export default Sidebar;
