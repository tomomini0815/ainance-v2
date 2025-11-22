import React, { useState, useMemo } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAuth } from '../hooks/useAuth';

const Layout: React.FC = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
    const { user } = useAuth();

    const userId = useMemo(() => {
        return user?.id || "user_001"
    }, [user?.id])

    const toggleSidebarExpand = () => {
        setIsSidebarExpanded(!isSidebarExpanded);
    };

    const toggleMobileSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const closeMobileSidebar = () => {
        setIsSidebarOpen(false);
    };

    return (
        <div className="min-h-screen bg-background text-text-main font-sans selection:bg-primary/30">
            <Sidebar
                isOpen={isSidebarOpen}
                isExpanded={isSidebarExpanded}
                onToggleExpand={toggleSidebarExpand}
                onCloseMobile={closeMobileSidebar}
                userId={userId}
            />

            <div
                className={`
          flex flex-col min-h-screen transition-all duration-300 ease-in-out
          ${isSidebarExpanded ? 'md:pl-72' : 'md:pl-20'}
        `}
            >
                <Header onMenuClick={toggleMobileSidebar} />

                <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
                    <div className="max-w-7xl mx-auto animate-in fade-in duration-500">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;
