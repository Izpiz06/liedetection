import { Search, Filter } from 'lucide-react';

export default function SearchBar({ value, onChange, placeholder = 'Search...', filters = [], activeFilter, onFilterChange }) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="neo-input pl-12"
        />
      </div>
      {filters.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <Filter size={16} className="opacity-40" />
          <button
            onClick={() => onFilterChange?.('')}
            className={`px-3 py-2 text-sm font-bold border-3 border-neo-text dark:border-white/30 transition-all ${
              !activeFilter
                ? 'bg-neo-yellow shadow-neo-sm'
                : 'bg-white dark:bg-neo-dark-card hover:bg-gray-100'
            }`}
            style={{ borderRadius: '4px' }}
          >
            All
          </button>
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => onFilterChange?.(f)}
              className={`px-3 py-2 text-sm font-bold border-3 border-neo-text dark:border-white/30 transition-all ${
                activeFilter === f
                  ? 'bg-neo-blue text-white shadow-neo-sm'
                  : 'bg-white dark:bg-neo-dark-card hover:bg-gray-100'
              }`}
              style={{ borderRadius: '4px' }}
            >
              {f}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
