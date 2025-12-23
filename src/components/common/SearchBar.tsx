import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaTimes } from 'react-icons/fa';
import { videosApi } from '../../services/videosApi';
import { playlistsApi } from '../../services/playlistsApi';
import { channelsApi } from '../../services/channelsApi';
import '../../styles/search-bar.css';

interface SearchSuggestion {
  type: 'video' | 'playlist' | 'channel';
  id: string | number;
  title: string;
  subtitle?: string;
  icon: string;
  channelId?: number;
}

const SearchBar: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const navigate = useNavigate();
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch suggestions
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const fetchSuggestions = async () => {
      try {
        const lowerQuery = searchQuery.toLowerCase();
        const allSuggestions: SearchSuggestion[] = [];

        // Fetch videos
        try {
          const videosResponse = await videosApi.getAll();
          const videos = (videosResponse as any)?.data || videosResponse || [];
          
          videos.slice(0, 20).forEach((video: any) => {
            if (
              video.title?.toLowerCase().includes(lowerQuery) ||
              video.channelName?.toLowerCase().includes(lowerQuery)
            ) {
              allSuggestions.push({
                type: 'video',
                id: video.vidID || video.id || 0,
                title: video.title || 'Untitled',
                subtitle: video.channelName || 'Unknown channel',
                icon: '🎬',
                channelId: video.channelId || video.channelID,
              });
            }
          });
        } catch (err) {
          console.error('Error fetching videos:', err);
        }

        // Fetch playlists
        try {
          const playlistsResponse = await playlistsApi.getAll();
          const playlists = (playlistsResponse as any)?.data || playlistsResponse || [];
          
          playlists.slice(0, 20).forEach((playlist: any) => {
            if (
              playlist.name?.toLowerCase().includes(lowerQuery) ||
              playlist.user?.userName?.toLowerCase().includes(lowerQuery)
            ) {
              allSuggestions.push({
                type: 'playlist',
                id: playlist.pID || playlist.id || 0,
                title: playlist.name || 'Untitled Playlist',
                subtitle: `by ${playlist.user?.userName || 'Unknown'}`,
                icon: '📋',
                channelId: playlist.channelId || playlist.channelID || playlist.user?.userID,
              });
            }
          });
        } catch (err) {
          console.error('Error fetching playlists:', err);
        }

        // Fetch channels
        try {
          const channelsResponse = await channelsApi.getAll();
          const channels = (channelsResponse as any)?.data || channelsResponse || [];

          channels.slice(0, 20).forEach((channel: any) => {
            if (
              channel.channelName?.toLowerCase().includes(lowerQuery) ||
              channel.channelDescription?.toLowerCase().includes(lowerQuery)
            ) {
              allSuggestions.push({
                type: 'channel',
                id: channel.channelID || channel.id || 0,
                title: channel.channelName || 'Channel',
                subtitle: channel.channelDescription || 'Channel',
                icon: '📡',
              });
            }
          });
        } catch (err) {
          console.error('Error fetching channels:', err);
        }

        // Sort suggestions: videos first, then playlists, then channels, and limit to 8
        allSuggestions.sort((a, b) => {
          const typeOrder = { video: 0, playlist: 1, channel: 2 } as Record<string, number>;
          return typeOrder[a.type] - typeOrder[b.type];
        });

        setSuggestions(allSuggestions.slice(0, 8));
        setShowSuggestions(true);
        setHighlightedIndex(-1);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent<HTMLFormElement> | any) => {
    e.preventDefault?.();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setShowSuggestions(false);
      setHighlightedIndex(-1);
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    if (suggestion.type === 'video') {
      navigate(`/video/${suggestion.id}`);
    } else if (suggestion.type === 'playlist') {
      navigate(`/playlists/${suggestion.id}`);
    } else if (suggestion.type === 'channel') {
      navigate(`/channel/${suggestion.id}`);
    }
    setSearchQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'Enter') {
        handleSearch(e as any);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0) {
          handleSuggestionClick(suggestions[highlightedIndex]);
        } else {
          handleSearch(e as any);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setHighlightedIndex(-1);
        break;
      default:
        break;
    }
  };

  return (
    <div className="search-bar-wrapper">
      <form className="search-bar" onSubmit={handleSearch} aria-label="Search bar">
        {/* Clear button - appears LEFT of search icon when there's text */}
        {searchQuery && (
          <button
            type="button"
            className="clear-search-btn"
            onClick={(e) => {
              e.stopPropagation();
              setSearchQuery('');
              setSuggestions([]);
              setShowSuggestions(false);
              inputRef.current?.focus();
            }}
            aria-label="Clear search"
          >
            <FaTimes />
          </button>
        )}
        
        {/* Search icon - ALWAYS visible, RIGHT side */}
        <button
          type="submit"
          className="search-icon-btn"
          aria-label="Search"
        >
          <FaSearch />
        </button>

        {/* Input field - fills remaining space */}
        <input
          ref={inputRef}
          type="text"
          placeholder="Search for lectures, clubs, events..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => searchQuery.trim() && setShowSuggestions(true)}
          aria-label="Search input"
        />
      </form>

      {/* Dropdown Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="search-suggestions-dropdown" ref={suggestionsRef}>
          {suggestions.map((suggestion, index) => (
            <div
              key={`${suggestion.type}-${suggestion.id}`}
              className={`suggestion-item ${
                index === highlightedIndex ? 'highlighted' : ''
              }`}
              onClick={() => handleSuggestionClick(suggestion)}
              role="button"
              tabIndex={0}
            >
              <span className="suggestion-icon">{suggestion.icon}</span>
              <div className="suggestion-content">
                <div className="suggestion-title">{suggestion.title}</div>
                {suggestion.subtitle && (
                  <div className="suggestion-subtitle">{suggestion.subtitle}</div>
                )}
              </div>
              <span className="suggestion-type">
                {suggestion.type === 'video' && 'Video'}
                {suggestion.type === 'playlist' && 'Playlist'}
                {suggestion.type === 'channel' && 'Channel'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
