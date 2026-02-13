import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react';

interface FiscalYearContextType {
    selectedYear: number;
    setSelectedYear: (year: number) => void;
    yearOptions: number[];
}

const FiscalYearContext = createContext<FiscalYearContextType | undefined>(undefined);

export const FiscalYearProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // 初期値は現在の年、または localStorage から取得
    const [selectedYear, setSelectedYearState] = useState<number>(() => {
        const saved = localStorage.getItem('selectedFiscalYear');
        return saved ? parseInt(saved, 10) : new Date().getFullYear();
    });

    // 年の選択肢（現在年から前後5年程度）
    const yearOptions = useMemo(() => {
        const currentYear = new Date().getFullYear();
        const years = [];
        for (let i = currentYear - 5; i <= currentYear + 1; i++) {
            years.push(i);
        }
        return years.sort((a, b) => b - a);
    }, []);

    const setSelectedYear = (year: number) => {
        setSelectedYearState(year);
        localStorage.setItem('selectedFiscalYear', year.toString());
    };

    return (
        <FiscalYearContext.Provider value={{ selectedYear, setSelectedYear, yearOptions }}>
            {children}
        </FiscalYearContext.Provider>
    );
};

export const useFiscalYear = () => {
    const context = useContext(FiscalYearContext);
    if (context === undefined) {
        throw new Error('useFiscalYear must be used within a FiscalYearProvider');
    }
    return context;
};

