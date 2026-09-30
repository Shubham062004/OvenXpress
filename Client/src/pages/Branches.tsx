// Client/src/pages/Branches.tsx
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBranch, Branch } from '../contexts/BranchContext';
import {
  MapPin,
  Clock,
  Phone,
  Search,
  CheckCircle,
  Navigation,
  Utensils,
  ShoppingBag,
  Truck,
  ArrowRight,
} from 'lucide-react';

export const Branches: React.FC = () => {
  const navigate = useNavigate();
  const { branches, selectedBranch, selectBranch, loading, cities } = useBranch();
  const [selectedCity, setSelectedCity] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredBranches = useMemo(() => {
    return branches.filter((b) => {
      const matchesCity = selectedCity === 'All' || b.city.toLowerCase() === selectedCity.toLowerCase();
      const matchesSearch =
        !searchQuery.trim() ||
        b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.city.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCity && matchesSearch;
    });
  }, [branches, selectedCity, searchQuery]);

  const handleSelectBranch = (branch: Branch) => {
    selectBranch(branch);
    navigate('/menu');
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/60 border border-red-800/40 text-red-400 text-xs font-semibold uppercase tracking-wider">
            <MapPin className="w-3.5 h-3.5" />
            Our Locations
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Find Your Nearest <span className="text-red-500">Oven Xpress</span>
          </h1>
          <p className="text-neutral-400 text-sm sm:text-base leading-relaxed">
            Select a branch to explore fresh artisanal pizzas, chef-crafted burgers, and sides tailored to your nearest kitchen.
          </p>
        </div>

        {/* Search & City Filter Bar */}
        <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-4 sm:p-6 backdrop-blur-md shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full sm:w-96">
              <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by branch name, area or city..."
                className="w-full pl-11 pr-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 text-sm transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-500 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Selected Branch Indicator */}
            {selectedBranch && (
              <div className="text-xs text-neutral-400 flex items-center gap-2 bg-neutral-950/80 px-3.5 py-2 rounded-xl border border-neutral-800">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Current branch: <strong className="text-white">{selectedBranch.name}</strong> ({selectedBranch.city})
              </div>
            )}
          </div>

          {/* City Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
            <button
              onClick={() => setSelectedCity('All')}
              className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                selectedCity === 'All'
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                  : 'bg-neutral-800/80 text-neutral-300 hover:bg-neutral-700'
              }`}
            >
              All Locations ({branches.length})
            </button>
            {cities.map((city) => {
              const count = branches.filter((b) => b.city.toLowerCase() === city.toLowerCase()).length;
              return (
                <button
                  key={city}
                  onClick={() => setSelectedCity(city)}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                    selectedCity.toLowerCase() === city.toLowerCase()
                      ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                      : 'bg-neutral-800/80 text-neutral-300 hover:bg-neutral-700'
                  }`}
                >
                  {city} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div
                key={idx}
                className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 h-64 animate-pulse flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="h-5 bg-neutral-800 rounded w-2/3" />
                  <div className="h-4 bg-neutral-800 rounded w-1/3" />
                  <div className="h-12 bg-neutral-800/60 rounded w-full" />
                </div>
                <div className="h-10 bg-neutral-800 rounded w-full" />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredBranches.length === 0 && (
          <div className="text-center py-16 bg-neutral-900/50 border border-neutral-800/80 rounded-2xl p-8 space-y-4">
            <div className="w-14 h-14 bg-neutral-800 rounded-full flex items-center justify-center mx-auto text-neutral-400">
              <MapPin className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-white">No branches found</h3>
            <p className="text-neutral-400 text-sm max-w-md mx-auto">
              We couldn&apos;t find any Oven Xpress branches matching &ldquo;{searchQuery}&rdquo;. Try another city or search term.
            </p>
            <button
              onClick={() => {
                setSelectedCity('All');
                setSearchQuery('');
              }}
              className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-sm font-medium transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Branch Cards Grid */}
        {!loading && filteredBranches.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBranches.map((branch) => {
              const isSelected = selectedBranch?.id === branch.id;
              return (
                <div
                  key={branch.id}
                  className={`relative flex flex-col justify-between rounded-2xl p-6 transition-all duration-300 border ${
                    isSelected
                      ? 'bg-neutral-900/90 border-red-500/80 shadow-xl shadow-red-900/20 ring-1 ring-red-500'
                      : 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900'
                  }`}
                >
                  {/* Top Bar: City & Status */}
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-neutral-800 text-neutral-300 border border-neutral-700">
                        {branch.city}
                      </span>
                      {isSelected ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2.5 py-0.5 rounded-full">
                          <CheckCircle className="w-3 h-3" />
                          Selected
                        </span>
                      ) : (
                        <span className="text-xs text-neutral-400 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Accepting Orders
                        </span>
                      )}
                    </div>

                    {/* Branch Title & Code */}
                    <h3 className="text-lg font-bold text-white group-hover:text-red-400 transition-colors">
                      {branch.name}
                    </h3>
                    <p className="text-xs text-neutral-500 mb-4">Code: {branch.code}</p>

                    {/* Info rows */}
                    <div className="space-y-2.5 text-xs text-neutral-300">
                      <div className="flex items-start gap-2.5">
                        <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{branch.address}</span>
                      </div>

                      {(branch.openingTime || branch.closingTime) && (
                        <div className="flex items-center gap-2.5 text-neutral-400">
                          <Clock className="w-4 h-4 text-neutral-500 shrink-0" />
                          <span>
                            Hours: {branch.openingTime || '10:00 AM'} - {branch.closingTime || '11:00 PM'}
                          </span>
                        </div>
                      )}

                      {branch.phone && (
                        <div className="flex items-center gap-2.5 text-neutral-400">
                          <Phone className="w-4 h-4 text-neutral-500 shrink-0" />
                          <a href={`tel:${branch.phone}`} className="hover:text-white transition-colors">
                            {branch.phone}
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Capabilities Badges */}
                    <div className="flex items-center gap-3 mt-4 pt-3 border-t border-neutral-800 text-xs text-neutral-400">
                      <span className="flex items-center gap-1" title="Delivery available">
                        <Truck className="w-3.5 h-3.5 text-emerald-400" /> Delivery
                      </span>
                      <span className="flex items-center gap-1" title="Takeaway / Pickup available">
                        <ShoppingBag className="w-3.5 h-3.5 text-blue-400" /> Takeaway
                      </span>
                      <span className="flex items-center gap-1" title="Dine-in available">
                        <Utensils className="w-3.5 h-3.5 text-amber-400" /> Dine-in
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-6 pt-4">
                    <button
                      onClick={() => handleSelectBranch(branch)}
                      className={`w-full py-2.5 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                        isSelected
                          ? 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/30'
                          : 'bg-neutral-800 hover:bg-neutral-700 text-white'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          View Branch Menu
                          <ArrowRight className="w-4 h-4" />
                        </>
                      ) : (
                        <>
                          <Navigation className="w-4 h-4" />
                          Order From This Branch
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Branches;
