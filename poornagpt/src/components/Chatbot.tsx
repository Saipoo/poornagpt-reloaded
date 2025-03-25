import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Bell } from 'lucide-react';

interface ChatbotProps {
  aiData: any;
  onRequestNewTool: (request: string) => void;
}

interface Notification {
  id: string;
  text: string;
  timestamp: number;
}

const NOTIFICATION_TIMEOUT = 5000; // 5 seconds

const Chatbot: React.FC<ChatbotProps> = ({ aiData, onRequestNewTool }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [messages, setMessages] = useState([
    { type: 'bot', text: 'Hello! How can I assist you today? Choose an option:', options: [
      'Search AI Tools',
      'Browse Categories',
      'View Resources',
      'Request New Tool'
    ]}
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle notifications cleanup
  useEffect(() => {
    const cleanup = setInterval(() => {
      const now = Date.now();
      setNotifications(prev => 
        prev.filter(notification => now - notification.timestamp < NOTIFICATION_TIMEOUT)
      );
    }, 1000);

    return () => clearInterval(cleanup);
  }, []);

  const showMainMenu = () => {
    setMessages(prev => [...prev, {
      type: 'bot',
      text: 'What would you like to do?',
      options: [
        'Search AI Tools',
        'Browse Categories',
        'View Resources',
        'Request New Tool'
      ]
    }]);
  };

  const addNotification = (text: string) => {
    const newNotification = {
      id: Math.random().toString(36).substr(2, 9),
      text,
      timestamp: Date.now()
    };
    setNotifications(prev => [...prev, newNotification]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = { type: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);

    // Check for greetings
    const greetings = ['hi', 'hello', 'hey', 'greetings'];
    if (greetings.includes(input.toLowerCase().trim())) {
      showMainMenu();
      setInput('');
      return;
    }

    // Search through AI tools
    const searchResults = Object.values(aiData.categories)
      .flatMap((category: any) => category.tools)
      .filter((tool: any) => 
        tool.name.toLowerCase().includes(input.toLowerCase()) ||
        tool.description.toLowerCase().includes(input.toLowerCase())
      );

    if (searchResults.length > 0) {
      const resultMessage = {
        type: 'bot',
        text: 'Here are some relevant tools:',
        results: searchResults
      };
      setMessages(prev => [...prev, resultMessage]);
      showMainMenu();
    } else {
      const notFoundMessage = {
        type: 'bot',
        text: 'I couldn\'t find any matching tools. Would you like to request this tool to be added?',
        options: ['Yes, request tool', 'No, thanks']
      };
      setMessages(prev => [...prev, notFoundMessage]);
      addNotification(`New tool request: ${input}`);
    }

    setInput('');
  };

  const handleOption = (option: string) => {
    setMessages(prev => [...prev, { type: 'user', text: option }]);

    switch (option) {
      case 'Yes, request tool':
        onRequestNewTool(messages[messages.length - 2].text);
        showMainMenu();
        break;
      case 'No, thanks':
        showMainMenu();
        break;
      case 'Search AI Tools':
        setMessages(prev => [...prev, {
          type: 'bot',
          text: 'What kind of AI tool are you looking for?'
        }]);
        break;
      case 'Browse Categories':
        const categories = aiData.categories.map((cat: any) => cat.name);
        setMessages(prev => [...prev, {
          type: 'bot',
          text: 'Here are all available categories:',
          options: categories
        }]);
        break;
      case 'View Resources':
        const resourceTypes = Object.keys(aiData.resources);
        setMessages(prev => [...prev, {
          type: 'bot',
          text: 'Choose a resource type:',
          options: resourceTypes
        }]);
        break;
      case 'Request New Tool':
        setMessages(prev => [...prev, {
          type: 'bot',
          text: 'Please describe the AI tool you\'d like to see added to our database:'
        }]);
        break;
      default:
        // Handle category selection
        const category = aiData.categories.find((cat: any) => cat.name === option);
        if (category) {
          setMessages(prev => [...prev, {
            type: 'bot',
            text: `Here are the tools in the ${option} category:`,
            results: category.tools
          }]);
          showMainMenu();
        }
        // Handle resource type selection
        const resourceType = aiData.resources[option.toLowerCase()];
        if (resourceType) {
          setMessages(prev => [...prev, {
            type: 'bot',
            text: `Here are the available ${option}:`,
            results: resourceType
          }]);
          showMainMenu();
        }
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Notifications */}
      <div className="fixed bottom-24 right-4 space-y-2">
        {notifications.map(notification => (
          <div
            key={notification.id}
            className="bg-card-light dark:bg-card-dark rounded-lg shadow-lg p-4 flex items-center gap-2 transition-colors duration-200 animate-fade-in"
          >
            <Bell className="h-5 w-5 text-yellow-500" />
            <p className="text-gray-800 dark:text-gray-200">{notification.text}</p>
            <button
              onClick={() => removeNotification(notification.id)}
              className="ml-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      {isOpen ? (
        <div className="bg-card-light dark:bg-card-dark rounded-lg shadow-xl w-80 h-96 flex flex-col transition-colors duration-200">
          <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
            <h3 className="font-semibold text-gray-800 dark:text-white">PoornaGPT Assistant</h3>
            <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`rounded-lg p-3 max-w-[80%] ${
                  msg.type === 'user'
                    ? 'bg-primary text-white dark:bg-primary-dark'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white'
                }`}>
                  <p>{msg.text}</p>
                  {msg.options && (
                    <div className="mt-2 space-y-2">
                      {msg.options.map((option: string) => (
                        <button
                          key={option}
                          onClick={() => handleOption(option)}
                          className="block w-full text-left px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
                  {msg.results && (
                    <div className="mt-2 space-y-2">
                      {msg.results.map((tool: any) => (
                        <a
                          key={tool.name}
                          href={tool.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-primary dark:text-primary-dark hover:underline"
                        >
                          {tool.name}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="p-4 border-t dark:border-gray-700">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type your message..."
                className="flex-1 px-3 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary-dark transition-colors duration-200"
              />
              <button
                onClick={handleSend}
                className="px-4 py-2 bg-primary dark:bg-primary-dark text-white rounded-lg hover:bg-primary-dark dark:hover:bg-primary transition-colors duration-200"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-primary dark:bg-primary-dark text-white p-4 rounded-full shadow-lg hover:bg-primary-dark dark:hover:bg-primary transition-colors duration-200"
        >
          <MessageSquare className="h-6 w-6" />
        </button>
      )}
    </div>
  );
};

export default Chatbot;