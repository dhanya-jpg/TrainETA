#!/bin/bash

# Find all TSX files
FILES=$(find src/components src/App.tsx -type f -name "*.tsx")

for file in $FILES; do
    sed -i 's/\bbg-white\b/bg-white dark:bg-[#1a1a1c]/g' "$file"
    sed -i 's/\bborder-slate-200\b/border-slate-200 dark:border-white\/10/g' "$file"
    sed -i 's/\btext-slate-900\b/text-slate-900 dark:text-[#f2f2f2]/g' "$file"
    sed -i 's/\btext-slate-800\b/text-slate-800 dark:text-[#f2f2f2]/g' "$file"
    sed -i 's/\btext-slate-700\b/text-slate-700 dark:text-[#f2f2f2]\/80/g' "$file"
    sed -i 's/\btext-slate-600\b/text-slate-600 dark:text-[#f2f2f2]\/70/g' "$file"
    sed -i 's/\btext-slate-500\b/text-slate-500 dark:text-[#f2f2f2]\/50/g' "$file"
    sed -i 's/\btext-slate-400\b/text-slate-400 dark:text-[#f2f2f2]\/40/g' "$file"
    
    sed -i 's/\bbg-slate-50\b/bg-slate-50 dark:bg-[#141416]/g' "$file"
    sed -i 's/\bbg-slate-100\b/bg-slate-100 dark:bg-white\/5/g' "$file"
    sed -i 's/\bbg-slate-900\b/bg-slate-900 dark:bg-white/g' "$file"

    sed -i 's/\brounded-3xl\b/rounded-3xl dark:rounded-none/g' "$file"
    sed -i 's/\brounded-2xl\b/rounded-2xl dark:rounded-none/g' "$file"
    sed -i 's/\brounded-xl\b/rounded-xl dark:rounded-none/g' "$file"
done

