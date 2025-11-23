import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useBusinessType } from '../hooks/useBusinessType';
import { useAuth } from '../hooks/useAuth';

interface BusinessType {
    id: string;
    user_id: string;
    business_type: 'individual' | 'corporation';
    company_name: string;
    tax_number: string;
    address: string;
    phone: string;
    email: string;
    representative_name: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

interface BusinessTypeContextType {
    currentBusinessType: BusinessType | null;
    businessTypes: BusinessType[];
    loading: boolean;
    createBusinessType: (data: Omit<BusinessType, 'id' | 'user_id' | 'is_active' | 'created_at' | 'updated_at'>) => Promise<BusinessType | null>;
    switchBusinessType: (businessTypeId: string) => Promise<void>;
    updateBusinessType: (businessTypeId: string, updates: Partial<BusinessType>) => Promise<BusinessType | null>;
    deleteBusinessType: (businessTypeId: string) => Promise<void>;
    refreshBusinessTypes: () => void;
}

const BusinessTypeContext = createContext<BusinessTypeContextType | undefined>(undefined);

export const BusinessTypeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const {
        currentBusinessType: hookCurrentBusinessType,
        businessTypes: hookBusinessTypes,
        loading: hookLoading,
        createBusinessType: hookCreateBusinessType,
        switchBusinessType: hookSwitchBusinessType,
        updateBusinessType: hookUpdateBusinessType,
        deleteBusinessType: hookDeleteBusinessType,
        refetch
    } = useBusinessType(user?.id);

    console.log('BusinessTypeProvider - user:', user);
    console.log('BusinessTypeProvider - hookCurrentBusinessType:', hookCurrentBusinessType);
    console.log('BusinessTypeProvider - hookBusinessTypes:', hookBusinessTypes);
    console.log('BusinessTypeProvider - hookLoading:', hookLoading);

    // Context state to ensure we can trigger updates
    const [currentBusinessType, setCurrentBusinessType] = useState<BusinessType | null>(null);
    const [businessTypes, setBusinessTypes] = useState<BusinessType[]>([]);
    const [loading, setLoading] = useState(true);

    // Sync with hook state
    useEffect(() => {
        console.log('BusinessTypeProvider - hook state updated');
        setCurrentBusinessType(hookCurrentBusinessType);
        setBusinessTypes(hookBusinessTypes);
        setLoading(hookLoading);
    }, [hookCurrentBusinessType, hookBusinessTypes, hookLoading]);

    const createBusinessType = useCallback(async (data: Omit<BusinessType, 'id' | 'user_id' | 'is_active' | 'created_at' | 'updated_at'>) => {
        return await hookCreateBusinessType(data);
    }, [hookCreateBusinessType]);

    const switchBusinessType = useCallback(async (businessTypeId: string) => {
        await hookSwitchBusinessType(businessTypeId);
    }, [hookSwitchBusinessType]);

    const updateBusinessType = useCallback(async (businessTypeId: string, updates: Partial<BusinessType>) => {
        return await hookUpdateBusinessType(businessTypeId, updates);
    }, [hookUpdateBusinessType]);

    const deleteBusinessType = useCallback(async (businessTypeId: string) => {
        await hookDeleteBusinessType(businessTypeId);
    }, [hookDeleteBusinessType]);

    const refreshBusinessTypes = useCallback(() => {
        refetch();
    }, [refetch]);

    return (
        <BusinessTypeContext.Provider value={{
            currentBusinessType,
            businessTypes,
            loading,
            createBusinessType,
            switchBusinessType,
            updateBusinessType,
            deleteBusinessType,
            refreshBusinessTypes
        }}>
            {children}
        </BusinessTypeContext.Provider>
    );
};

export const useBusinessTypeContext = () => {
    const context = useContext(BusinessTypeContext);
    if (context === undefined) {
        throw new Error('useBusinessTypeContext must be used within a BusinessTypeProvider');
    }
    return context;
};
