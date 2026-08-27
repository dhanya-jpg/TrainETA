#!/bin/bash
FILES=$(find src/components src/App.tsx -type f -name "*.tsx")
for file in $FILES; do
    sed -i 's/dark:bg-\[#1a1a1c\] dark:bg-\[#1a1a1c\]/dark:bg-\[#1a1a1c\]/g' "$file"
    sed -i 's/dark:bg-\[#111113\] dark:bg-\[#111113\]/dark:bg-\[#111113\]/g' "$file"
    sed -i 's/dark:rounded-none dark:rounded-none/dark:rounded-none/g' "$file"
    sed -i 's/dark:text-white dark:text-white/dark:text-white/g' "$file"
    sed -i 's/text-black dark:text-white dark:text-\[#f2f2f2\]/text-black dark:text-\[#f2f2f2\]/g' "$file"
done
