import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBars, FaSearch, FaVideo, FaBell } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import '../../styles/header.css';

const Header: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header>
      <div className="logo-section">
        <FaBars className="menu-icon" />
        <h1>
          VITC-<span>Stream</span>
        </h1>
      </div>

      <form className="search-bar" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search for lectures, clubs, events..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button type="submit">
          <FaSearch />
        </button>
      </form>

      <div className="user-icons">
        <Link to="/upload" title="Upload Video">
          <FaVideo />
        </Link>
        <FaBell />
        <img
          src={`https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=ffcc00&color=003366`}
          className="user-avatar"
          alt="Profile"
          title="Profile"
        />
      </div>
    </header>
  );
};

export default Header;
