import React, { useState, useEffect, useRef } from 'react';
import '../../styles/video-search-filter.css';

export interface Video {
  vidID?: number;
  id?: number;
  title: string;
  createdAt?: string;
  uploadedAt?: string;
  channel?: {
    channelName: string;
    user?: {
      userName: string;
    };
  };
  videoTags?: Array<{
    tagID?: number;
    tagName?: string;
  }>;
}

interface VideoSearchFilterProps {
  videos: Video[];
  onFilterChange: (filtered: Video[]) => void;
  disabled?: boolean;
}

const VideoSearchFilter: React.FC<VideoSearchFilterProps> = ({
  videos,
  onFilterChange,
  disabled = false,
}) => {
  const [searchType, setSearchType] = useState<'name' | 'creator' | 'tag'>('name');
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get unique suggestions based on search type
  const getUniqueSuggestions = (type: 'name' | 'creator' | 'tag', term: string): string[] => {
    if (!term.trim()) return [];

    const lowerTerm = term.toLowerCase();
    const unique = new Set<string>();

    videos.forEach((video) => {
      if (type === 'name') {
        if (video.title.toLowerCase().includes(lowerTerm)) {
          unique.add(video.title);
        }
      } else if (type === 'creator') {
        const creatorName = video.channel?.user?.userName || video.channel?.channelName || '';
        if (creatorName.toLowerCase().includes(lowerTerm)) {
          unique.add(creatorName);
        }
      } else if (type === 'tag') {
        video.videoTags?.forEach((tag) => {
          const tagName = tag.tagName || '';
          if (tagName.toLowerCase().includes(lowerTerm)) {
            unique.add(tagName);
          }
        });
      }
    });

    return Array.from(unique).slice(0, 8); // Limit to 8 suggestions
  };

  // Update suggestions when search term or type changes
  useEffect(() => {
    if (searchTerm.trim()) {
      const newSuggestions = getUniqueSuggestions(searchType, searchTerm);
      setSuggestions(newSuggestions);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchTerm, searchType, videos]);

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

  // Filter videos based on current search
  useEffect(() => {
    if (!searchTerm.trim()) {
      onFilterChange(videos);
      return;
    }

    const lowerTerm = searchTerm.toLowerCase();
    const filtered = videos.filter((video) => {
      if (searchType === 'name') {
        return video.title.toLowerCase().includes(lowerTerm);
      } else if (searchType === 'creator') {
        const creatorName = video.channel?.user?.userName || video.channel?.channelName || '';
        return creatorName.toLowerCase().includes(lowerTerm);
      } else if (searchType === 'tag') {
        return video.videoTags?.some((tag) =>
          (tag.tagName || '').toLowerCase().includes(lowerTerm)
        );
      }
      return false;
    });

    onFilterChange(filtered);
  }, [searchTerm, searchType, videos, onFilterChange]);

  const handleSuggestionClick = (suggestion: string) => {
    setSearchTerm(suggestion);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleSearchTypeChange = (type: 'name' | 'creator' | 'tag') => {
    setSearchType(type);
    setSearchTerm('');
    setSuggestions([]);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  return (
    <div className="video-search-filter">
      <div className="search-filter-controls">
        {/* Search Type Buttons */}
        <div className="search-type-buttons">
          <button
            className={`search-type-btn ${searchType === 'name' ? 'active' : ''}`}
            onClick={() => handleSearchTypeChange('name')}
            disabled={disabled}
            title="Search by video name"
          >
            📹 Name
          </button>
          <button
            className={`search-type-btn ${searchType === 'creator' ? 'active' : ''}`}
            onClick={() => handleSearchTypeChange('creator')}
            disabled={disabled}
            title="Search by creator name"
          >
            👤 Creator
          </button>
          <button
            className={`search-type-btn ${searchType === 'tag' ? 'active' : ''}`}
            onClick={() => handleSearchTypeChange('tag')}
            disabled={disabled}
            title="Search by tag"
          >
            🏷️ Tag
          </button>
        </div>

        {/* Search Input with Dropdown */}
        <div className="search-input-container">
          <input
            ref={inputRef}
            type="text"
            placeholder={`Search by ${searchType === 'name' ? 'video name' : searchType === 'creator' ? 'creator' : 'tag'}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => searchTerm.trim() && setShowSuggestions(true)}
            className="search-input-field"
            disabled={disabled}
          />
          
          {/* Dropdown Suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="suggestions-dropdown" ref={suggestionsRef}>
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="suggestion-item"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <span className="suggestion-icon">
                    {searchType === 'name' && '📹'}
                    {searchType === 'creator' && '👤'}
                    {searchType === 'tag' && '🏷️'}
                  </span>
                  <span className="suggestion-text">{suggestion}</span>
                </div>
              ))}
            </div>
          )}

          {/* Clear Button */}
          {searchTerm && (
            <button
              className="clear-search-btn"
              onClick={() => {
                setSearchTerm('');
                setShowSuggestions(false);
                inputRef.current?.focus();
              }}
              disabled={disabled}
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoSearchFilter;
