#!/bin/bash
FILES=$(find src/components src/App.tsx -type f -name "*.tsx")
for file in $FILES; do
    sed -i 's/\btext-white dark:text-\[#18181A\]/text-white/g' "$file"
    sed -i 's/\btext-black dark:text-white\b/text-black dark:text-white/g' "$file"
done
