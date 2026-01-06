import React, { createContext, useContext, useState, type ReactNode } from 'react';

interface UIContextType {
    isSidebarOpen: boolean;
    toggleSidebar: () => void;
    closeSidebar: () => void;
    openSidebar: () => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Default: sidebar closed, will be set based on screen size in useEffect
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Set initial sidebar state based on screen size (client-side only)
    React.useEffect(() => {
        const isDesktop = window.innerWidth > 768;
        setIsSidebarOpen(isDesktop);
        console.log('UIContext initialized:', { isDesktop, isSidebarOpen: isDesktop });
    }, []);

    const toggleSidebar = () => {
        setIsSidebarOpen(prev => {
            console.log('toggleSidebar:', !prev);
            return !prev;
        });
    };

    const closeSidebar = () => {
        console.log('closeSidebar');
        setIsSidebarOpen(false);
    };
    
    const openSidebar = () => {
        console.log('openSidebar');
        setIsSidebarOpen(true);
    };

    return (
        <UIContext.Provider value={{ isSidebarOpen, toggleSidebar, closeSidebar, openSidebar }}>
            {children}
        </UIContext.Provider>
    );
};

export const useUI = () => {
    const context = useContext(UIContext);
    if (!context) {
        throw new Error('useUI must be used within a UIProvider');
    }
    return context;
};
