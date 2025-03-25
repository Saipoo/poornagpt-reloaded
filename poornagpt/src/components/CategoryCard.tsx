import React from 'react';
import { ExternalLink } from 'lucide-react';

interface Tool {
  name: string;
  url: string;
  description: string;
}

interface CategoryCardProps {
  name: string;
  tools: Tool[];
  onFavorite: (tool: Tool) => void;
  favorites: Tool[];
}

const CategoryCard: React.FC<CategoryCardProps> = ({ name, tools, onFavorite, favorites }) => {
  return (
    <div className="bg-card-light dark:bg-card-dark rounded-lg shadow-md p-6 transition-all duration-200 hover:shadow-lg">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">{name}</h2>
      <div className="space-y-3">
        {tools.map((tool) => (
          <div key={tool.name} className="flex items-center justify-between">
            <div className="flex-1">
              <a
                href={tool.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary dark:text-primary-dark hover:text-primary-dark dark:hover:text-primary flex items-center gap-2"
              >
                {tool.name}
                <ExternalLink className="h-4 w-4" />
              </a>
              <p className="text-sm text-gray-600 dark:text-gray-400">{tool.description}</p>
            </div>
            <button
              onClick={() => onFavorite(tool)}
              className={`ml-2 p-1 rounded transition-colors duration-200 ${
                favorites.some(f => f.name === tool.name)
                  ? 'text-yellow-500'
                  : 'text-gray-400 hover:text-yellow-500'
              }`}
            >
              ★
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryCard;