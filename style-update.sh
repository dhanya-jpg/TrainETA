#!/bin/bash

# Update index.css
cat << 'CSS_EOF' > src/index.css
@import "tailwindcss";

@custom-variant dark (&:where(.dark, .dark *));

:root {
  --bg: #c8c8c8;
  --ink: #141414;
  --accent: #f9423a;
  --surface: #c8c8c8;
  --surface-dark: #141414;
  --border: #141414;
}

.dark {
  --bg: #141414;
  --ink: #c8c8c8;
  --accent: #f9423a;
  --surface: #141414;
  --surface-dark: #c8c8c8;
  --border: #c8c8c8;
}

* {
  box-sizing: border-box;
  -webkit-font-smoothing: antialiased;
}

body {
  margin: 0;
  background-color: #141414;
  color: var(--ink);
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  min-height: 100vh;
}

::selection {
  background: var(--accent);
  color: white;
}

.font-display {
  font-family: 'Bricolage Grotesque', sans-serif;
  font-weight: 800;
  font-stretch: 125%;
  text-transform: uppercase;
}

.font-mono-code {
  font-family: 'JetBrains Mono', monospace;
}

::-webkit-scrollbar {
  width: 0px;
  height: 0px;
}
CSS_EOF

# Remove ambient background and restore normal App.tsx layout
sed -i 's/<AmbientBackground \/>//g' src/App.tsx
sed -i 's/className="dark flex/className="flex/g' src/App.tsx
sed -i 's/bg-transparent/bg-\[#141414\]/g' src/App.tsx

# Replace random bgs with flat colors in components
find src/components/ -type f -name "*.tsx" -exec sed -i 's/bg-[#000000]/bg-[#141414]/g' {} +
find src/components/ -type f -name "*.tsx" -exec sed -i 's/bg-[#09090B]/bg-[#141414]/g' {} +
find src/components/ -type f -name "*.tsx" -exec sed -i 's/bg-white dark:bg-[#1a1a1c]/bg-[#c8c8c8] text-[#141414]/g' {} +
find src/components/ -type f -name "*.tsx" -exec sed -i 's/shadow-sm//g' {} +
find src/components/ -type f -name "*.tsx" -exec sed -i 's/shadow-md//g' {} +
find src/components/ -type f -name "*.tsx" -exec sed -i 's/rounded-2xl/rounded-3xl/g' {} +
find src/components/ -type f -name "*.tsx" -exec sed -i 's/border border-black\/5//g' {} +
find src/components/ -type f -name "*.tsx" -exec sed -i 's/dark:border-white\/5//g' {} +

