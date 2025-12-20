import React from 'react';
import '../../styles/tags.css';

interface CategoryTagsProps {
  tags: string[];
  activeTag: string;
  onTagChange: (tag: string) => void;
}

const CategoryTags: React.FC<CategoryTagsProps> = ({ tags, activeTag, onTagChange }) => {
  return (
    <div className="categories">
      {tags.map((tag) => (
        <div
          key={tag}
          className={`tag ${tag === activeTag ? 'active' : ''}`}
          onClick={() => onTagChange(tag)}
        >
          {tag}
        </div>
      ))}
    </div>
  );
};

export default CategoryTags;
