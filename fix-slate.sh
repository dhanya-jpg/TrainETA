find src/ -type f -name "*.tsx" -exec sed -i 's/text-slate-400/text-ink\/50/g' {} +
find src/ -type f -name "*.tsx" -exec sed -i 's/text-slate-500/text-ink\/60/g' {} +
find src/ -type f -name "*.tsx" -exec sed -i 's/text-slate-600/text-ink\/70/g' {} +
find src/ -type f -name "*.tsx" -exec sed -i 's/text-slate-700/text-ink\/80/g' {} +
find src/ -type f -name "*.tsx" -exec sed -i 's/text-slate-800/text-ink\/90/g' {} +
find src/ -type f -name "*.tsx" -exec sed -i 's/text-slate-900/text-ink/g' {} +
find src/ -type f -name "*.tsx" -exec sed -i 's/text-white/text-bg/g' {} +
