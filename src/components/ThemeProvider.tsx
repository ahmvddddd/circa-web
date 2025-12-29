// src/components/ThemeProvider.tsx
"use client";

import React, { useEffect } from 'react';

// This is a minimal hook for system theme management
const useSystemTheme = () => {
    useEffect(() => {
        // Function to update the class on the document root
        const updateThemeClass = (isDark: boolean) => {
            if (isDark) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        };

        // 1. Check initial preference and apply class
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        updateThemeClass(mediaQuery.matches);
        
        // 2. Listen for changes in preference
        const handleChange = (e: MediaQueryListEvent) => {
            updateThemeClass(e.matches);
        };

        mediaQuery.addEventListener('change', handleChange);

        // Cleanup the listener on component unmount
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []); 

    // This component only manages the class and doesn't render extra DOM
    return null;
};

// Wrap the hook in a component to use it in layout.tsx
export default function ThemeProvider({ children }: { children: React.ReactNode }) {
    useSystemTheme();
    return <>{children}</>;
}