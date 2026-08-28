sed -i '11s/.*/  --color-gold: var(--gold);\n  --color-on-accent: #111111;/g' src/index.css
find src/ -type f -name "*.tsx" -exec sed -i 's/text-bg/text-on-accent/g' {} +
