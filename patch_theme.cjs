const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Insert state
code = code.replace(
  'const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState<boolean>(true);',
  'const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState<boolean>(true);\n  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);\n\n  useEffect(() => {\n    if (isDarkMode) {\n      document.documentElement.classList.add("dark");\n    } else {\n      document.documentElement.classList.remove("dark");\n    }\n  }, [isDarkMode]);\n\n  const toggleTheme = () => setIsDarkMode(!isDarkMode);'
);

// Fix TopNav
code = code.replace(
  '<TopNav',
  '<TopNav\n          isDarkMode={isDarkMode}\n          onToggleTheme={toggleTheme}'
);

fs.writeFileSync('src/App.tsx', code);
