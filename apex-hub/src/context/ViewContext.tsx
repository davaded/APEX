"use client";

import React, { createContext, useContext, useState } from "react";

type ViewMode = "grid" | "compact";
export type AppSection = "dashboard" | "timeline" | "tags" | "analytics" | "settings" | "profile";

interface ViewContextType {
    viewMode: ViewMode;
    setViewMode: (mode: ViewMode) => void;
    activeApp: AppSection;
    setActiveApp: (app: AppSection) => void;
}

const ViewContext = createContext<ViewContextType | undefined>(undefined);

export function ViewProvider({ children }: { children: React.ReactNode }) {
    const [viewMode, setViewMode] = useState<ViewMode>("grid");
    const [activeApp, setActiveApp] = useState<AppSection>("dashboard");

    return (
        <ViewContext.Provider value={{ viewMode, setViewMode, activeApp, setActiveApp }}>
            {children}
        </ViewContext.Provider>
    );
}

export function useView() {
    const context = useContext(ViewContext);
    if (context === undefined) {
        throw new Error("useView must be used within a ViewProvider");
    }
    return context;
}
