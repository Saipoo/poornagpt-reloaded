import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import Navbar from './components/Navbar';
import CategoryCard from './components/CategoryCard';
import Chatbot from './components/Chatbot';
import aiData from './data/aiData.json';

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return saved ? JSON.parse(saved) : prefersDark;
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('favorites');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [notifications, setNotifications] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const itemsPerPage = 9;

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const toggleFavorite = (tool: any) => {
    setFavorites(prev => {
      const exists = prev.some(f => f.name === tool.name);
      if (exists) {
        return prev.filter(f => f.name !== tool.name);
      }
      return [...prev, tool];
    });
  };

  const handleNewToolRequest = (request: string) => {
    setNotifications(prev => [...prev, `New tool request: ${request}`]);
  };

  const filteredCategories = aiData.categories.filter(category =>
    category.tools.some(tool =>
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const paginatedCategories = filteredCategories.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark transition-colors duration-200">
      <Navbar
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Notifications */}
        {notifications.length > 0 && (
          <div className="fixed top-20 right-4 z-50">
            {notifications.map((notification, index) => (
              <div
                key={index}
                className="bg-card-light dark:bg-card-dark rounded-lg shadow-lg p-4 mb-2 flex items-center gap-2 transition-colors duration-200"
              >
                <Bell className="h-5 w-5 text-yellow-500" />
                <p className="text-gray-800 dark:text-gray-200">{notification}</p>
              </div>
            ))}
          </div>
        )}

        {/* Favorites Section */}
        {favorites.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Favorites</h2>
            <div className="bg-card-light dark:bg-card-dark rounded-lg shadow-md p-6 transition-colors duration-200">
              <div className="grid gap-4">
                {favorites.map(tool => (
                  <div key={tool.name} className="flex items-center justify-between">
                    <a
                      href={tool.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary dark:text-primary-dark hover:underline"
                    >
                      {tool.name}
                    </a>
                    <button
                      onClick={() => toggleFavorite(tool)}
                      className="text-yellow-500"
                    >
                      ★
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedCategories.map(category => (
            <CategoryCard
              key={category.name}
              name={category.name}
              tools={category.tools}
              onFavorite={toggleFavorite}
              favorites={favorites}
            />
          ))}
        </div>

        {/* Pagination */}
        {filteredCategories.length > itemsPerPage && (
          <div className="mt-8 flex justify-center space-x-2">
            {Array.from({ length: Math.ceil(filteredCategories.length / itemsPerPage) }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`px-4 py-2 rounded transition-colors duration-200 ${
                  page === i + 1
                    ? 'bg-primary text-white dark:bg-primary-dark'
                    : 'bg-card-light dark:bg-card-dark text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </main>

      <Chatbot aiData={aiData} onRequestNewTool={handleNewToolRequest} />

      <footer className="bg-card-light dark:bg-card-dark shadow-md mt-8 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-gray-600 dark:text-gray-400">
            © 2025 PoornaGPT. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;