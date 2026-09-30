// Client/src/contexts/BranchContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { branchAPI } from '../services/api';

export interface Branch {
  id: string;
  name: string;
  code: string;
  description?: string;
  address: string;
  city: string;
  state?: string;
  postalCode?: string;
  phone?: string;
  email?: string;
  openingTime?: string;
  closingTime?: string;
  status: string;
}

interface BranchContextType {
  branches: Branch[];
  selectedBranch: Branch | null;
  loading: boolean;
  cities: string[];
  selectBranch: (branch: Branch) => void;
  refreshBranches: () => Promise<void>;
  isBranchModalOpen: boolean;
  setIsBranchModalOpen: (open: boolean) => void;
}

const BranchContext = createContext<BranchContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'ovenxpress_selected_branch';

export const useBranch = (): BranchContextType => {
  const context = useContext(BranchContext);
  if (!context) {
    throw new Error('useBranch must be used within a BranchProvider');
  }
  return context;
};

export const BranchProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranchState] = useState<Branch | null>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [cities, setCities] = useState<string[]>([]);
  const [isBranchModalOpen, setIsBranchModalOpen] = useState<boolean>(false);

  const selectBranch = (branch: Branch) => {
    setSelectedBranchState(branch);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(branch));
    } catch (err) {
      console.warn('Failed to save selected branch to localStorage:', err);
    }
    setIsBranchModalOpen(false);
  };

  const fetchBranches = async () => {
    try {
      setLoading(true);
      const res = await branchAPI.getBranches();
      if (res?.data?.success && Array.isArray(res.data.data)) {
        const branchList: Branch[] = res.data.data;
        setBranches(branchList);

        // Derive unique cities
        const uniqueCities = Array.from(new Set(branchList.map((b) => b.city).filter(Boolean)));
        setCities(uniqueCities);

        // If no branch selected yet or previous selection no longer exists, select first active branch
        setSelectedBranchState((prev) => {
          if (prev && branchList.some((b) => b.id === prev.id)) {
            return prev;
          }
          const defaultBranch = branchList[0] || null;
          if (defaultBranch) {
            try {
              localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(defaultBranch));
            } catch {
              // ignore
            }
          }
          return defaultBranch;
        });
      }
    } catch (err) {
      console.error('Failed to load branches:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const value: BranchContextType = {
    branches,
    selectedBranch,
    loading,
    cities,
    selectBranch,
    refreshBranches: fetchBranches,
    isBranchModalOpen,
    setIsBranchModalOpen,
  };

  return <BranchContext.Provider value={value}>{children}</BranchContext.Provider>;
};

export default BranchContext;
