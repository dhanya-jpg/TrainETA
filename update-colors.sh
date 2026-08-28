#!/bin/bash

# Replace hardcoded colors with variables
find src/ -type f -name "*.tsx" -exec sed -i 's/bg-\[#141414\]/bg-bg/g' {} +
find src/ -type f -name "*.tsx" -exec sed -i 's/bg-\[#c8c8c8\]/bg-surface-dark/g' {} +
find src/ -type f -name "*.tsx" -exec sed -i 's/bg-\[#f2f2f2\]/bg-surface/g' {} +

find src/ -type f -name "*.tsx" -exec sed -i 's/text-\[#141414\]/text-ink/g' {} +
find src/ -type f -name "*.tsx" -exec sed -i 's/text-\[#f9423a\]/text-accent/g' {} +
find src/ -type f -name "*.tsx" -exec sed -i 's/bg-\[#f9423a\]/bg-accent/g' {} +
find src/ -type f -name "*.tsx" -exec sed -i 's/border-\[#c8c8c8\]/border-border/g' {} +
find src/ -type f -name "*.tsx" -exec sed -i 's/border-\[#141414\]\/10/border-border/g' {} +

find src/ -type f -name "*.tsx" -exec sed -i 's/text-white/text-bg/g' {} +
find src/ -type f -name "*.tsx" -exec sed -i 's/text-emerald-700/text-green-700 dark:text-green-400/g' {} +
find src/ -type f -name "*.tsx" -exec sed -i 's/bg-emerald-500\/20/bg-green-500\/20/g' {} +
find src/ -type f -name "*.tsx" -exec sed -i 's/border-emerald-500\/30/border-green-500\/30/g' {} +

