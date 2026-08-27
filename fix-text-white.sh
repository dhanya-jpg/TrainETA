#!/bin/bash
FILES=$(find src/components src/App.tsx -type f -name "*.tsx")
for file in $FILES; do
    sed -i 's/\btext-white\b/text-white dark:text-[#18181A]/g' "$file"
done
