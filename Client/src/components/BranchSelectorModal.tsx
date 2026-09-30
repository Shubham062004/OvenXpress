// Client/src/components/BranchSelectorModal.tsx
import React, { useState } from 'react';
import { useBranch, Branch } from '../contexts/BranchContext';
import { useCart } from '../contexts/CartContext';
import { MapPin, X, Check, AlertTriangle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const BranchSelectorModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { branches, selectedBranch, selectBranch, cities } = useBranch();
  const { items, clearCart } = useCart();
  const [selectedCity, setSelectedCity] = useState<string>('All');
  const [pendingBranch, setPendingBranch] = useState<Branch | null>(null);
  const [showCartWarning, setShowCartWarning] = useState<boolean>(false);

  if (!isOpen) return null;

  const filteredBranches = branches.filter((b) => {
    return selectedCity === 'All' || b.city.toLowerCase() === selectedCity.toLowerCase();
  });

  const handleBranchClick = (branch: Branch) => {
    if (selectedBranch?.id === branch.id) {
      onClose();
      return;
    }

    // If cart has items from another branch, warn customer
    if (items.length > 0) {
      setPendingBranch(branch);
      setShowCartWarning(true);
      return;
    }

    selectBranch(branch);
    onClose();
  };

  const handleConfirmSwitch = () => {
    if (pendingBranch) {
      clearCart();
      selectBranch(pendingBranch);
      setPendingBranch(null);
      setShowCartWarning(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-red-950/80 text-red-500 border border-red-800/40">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Select Your Branch</h2>
              <p className="text-xs text-neutral-400">Choose the kitchen to prepare and dispatch your meal</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Warning if switching branches with items in cart */}
        {showCartWarning && pendingBranch && (
          <div className="my-4 p-4 rounded-2xl bg-amber-950/60 border border-amber-800/60 text-amber-200 text-sm space-y-3">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-white">Switch branch to {pendingBranch.name}?</p>
                <p className="text-xs text-amber-300/80 mt-1">
                  Your cart contains {items.length} item(s) from {selectedBranch?.name || 'another branch'}. Switching branches will reset your cart.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 justify-end pt-1">
              <button
                onClick={() => {
                  setShowCartWarning(false);
                  setPendingBranch(null);
                }}
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-neutral-400 hover:text-white bg-neutral-800 hover:bg-neutral-700"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSwitch}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-red-600 hover:bg-red-500 shadow-md shadow-red-600/30"
              >
                Clear Cart &amp; Switch
              </button>
            </div>
          </div>
        )}

        {/* City Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto py-3 border-b border-neutral-800 scrollbar-thin">
          <button
            onClick={() => setSelectedCity('All')}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              selectedCity === 'All'
                ? 'bg-red-600 text-white'
                : 'bg-neutral-800 text-neutral-400 hover:text-white'
            }`}
          >
            All Cities
          </button>
          {cities.map((city) => (
            <button
              key={city}
              onClick={() => setSelectedCity(city)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                selectedCity.toLowerCase() === city.toLowerCase()
                  ? 'bg-red-600 text-white'
                  : 'bg-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              {city}
            </button>
          ))}
        </div>

        {/* Branches List */}
        <div className="flex-1 overflow-y-auto py-3 space-y-2.5 pr-1 scrollbar-thin">
          {filteredBranches.map((branch) => {
            const isSelected = selectedBranch?.id === branch.id;
            return (
              <button
                key={branch.id}
                onClick={() => handleBranchClick(branch)}
                className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-red-950/30 border-red-500/60 ring-1 ring-red-500/40'
                    : 'bg-neutral-950/60 border-neutral-800/80 hover:bg-neutral-800/60 hover:border-neutral-700'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-white">{branch.name}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-800 text-neutral-300">
                      {branch.city}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 line-clamp-1">{branch.address}</p>
                </div>

                {isSelected ? (
                  <div className="flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-lg border border-emerald-800/60 shrink-0">
                    <Check className="w-3.5 h-3.5" />
                    Selected
                  </div>
                ) : (
                  <span className="text-xs text-neutral-500 shrink-0">Select</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BranchSelectorModal;
