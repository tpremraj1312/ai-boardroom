import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { SandpackProvider, SandpackPreview, useSandpack } from '@codesandbox/sandpack-react';

/* ── Map our VFS to Sandpack-compatible format ─────────── */
const mapFilesForSandpack = (fileSystem) => {
    const sandpackFiles = {};
    if (!fileSystem) return sandpackFiles;

    for (const [filePath, content] of Object.entries(fileSystem)) {
        if (filePath.startsWith('client/src/') || filePath === 'client/index.html') {
            let sandpackPath = '/' + filePath.replace('client/', '');
            sandpackFiles[sandpackPath] = { code: content || '', active: false };
        }
    }

    // Identify entry point
    const entryPoint = sandpackFiles['/src/main.jsx'] ? '/src/main.jsx'
        : sandpackFiles['/src/index.jsx'] ? '/src/index.jsx'
        : sandpackFiles['/src/index.js'] ? '/src/index.js'
        : sandpackFiles['/src/main.js'] ? '/src/main.js'
        : '/src/main.jsx'; // fallback

    // Ensure entry point exists
    if (!sandpackFiles[entryPoint] && !sandpackFiles['/src/index.js'] && !sandpackFiles['/src/main.js']) {
        sandpackFiles[entryPoint] = {
            code: `import React from "react";\nimport { createRoot } from "react-dom/client";\nimport App from "./App";\n\nconst root = createRoot(document.getElementById("root"));\nroot.render(<App />);`,
            active: false
        };
    }

    if (!sandpackFiles['/src/App.jsx'] && !sandpackFiles['/src/App.js']) {
        sandpackFiles['/src/App.jsx'] = {
            code: `import React from "react";\nexport default function App() {\n  return <div className="p-8 text-center"><h1 className="text-2xl font-bold">Preview</h1><p className="text-gray-500 mt-2">App generated — preview will appear here.</p></div>;\n}`,
            active: false
        };
    }

    if (sandpackFiles[entryPoint]) {
        sandpackFiles[entryPoint].active = true;
    }

    // For Vite, we MUST have an index.html at root pointing to the entry module
    if (!sandpackFiles['/index.html']) {
        sandpackFiles['/index.html'] = {
            code: `<!DOCTYPE html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <title>Preview</title>\n  </head>\n  <body>\n    <div id="root"></div>\n    <script type="module" src="${entryPoint}"></script>\n  </body>\n</html>`,
            active: false
        };
    }

    return sandpackFiles;
};

/* ── Extract dependencies so Sandpack can bundle correctly ── */
const extractDependencies = (fileSystem) => {
    let deps = {
        "react": "^18.2.0",
        "react-dom": "^18.2.0",
        "lucide-react": "latest",
        "recharts": "^2.12.0",
        "framer-motion": "^11.0.0",
        "react-router-dom": "^6.22.0",
        "react-icons": "^5.0.0",
        "clsx": "^2.1.0",
        "tailwind-merge": "^2.2.0"
    };

    const pkgContent = fileSystem['client/package.json'] || fileSystem['package.json'];
    if (pkgContent) {
        try {
            const parsed = JSON.parse(pkgContent);
            if (parsed.dependencies) {
                deps = { ...deps, ...parsed.dependencies };
            }
        } catch (e) {
            console.error("Failed to parse package.json for Sandpack", e);
        }
    }
    return deps;
};

/* ── Loading listener that watches Sandpack status ──────── */
const SandpackLoadingWatcher = ({ onLoaded }) => {
    const { sandpack } = useSandpack();

    useEffect(() => {
        if (sandpack.status === 'running') {
            onLoaded();
        }
    }, [sandpack.status, onLoaded]);

    return null;
};

const LivePreview = ({ fileSystem, previewKey }) => {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [previewUrl, setPreviewUrl] = useState('/');
    const [isLoading, setIsLoading] = useState(true);
    const [localRefreshKey, setLocalRefreshKey] = useState(0);
    const timerRef = useRef(null);

    const sandpackFiles = useMemo(() => mapFilesForSandpack(fileSystem), [fileSystem]);
    const hasFiles = Object.keys(sandpackFiles).length > 0;
    const customDependencies = useMemo(() => extractDependencies(fileSystem), [fileSystem]);
    const effectiveKey = `${previewKey}-${localRefreshKey}`;

    // Reset loading on key change + fallback timer
    useEffect(() => {
        if (!hasFiles) return;
        setIsLoading(true);
        // Fallback: hide loading after 5s even if sandpack hasn't signaled
        timerRef.current = setTimeout(() => setIsLoading(false), 5000);
        return () => { if (timerRef.current) clearTimeout(timerRef.current); };
    }, [effectiveKey, hasFiles]);

    const handleSandpackLoaded = useCallback(() => {
        setIsLoading(false);
        if (timerRef.current) clearTimeout(timerRef.current);
    }, []);

    const handleRefresh = useCallback(() => {
        setLocalRefreshKey(k => k + 1);
        setIsLoading(true);
    }, []);

    const handleUrlChange = useCallback((e) => {
        if (e.key === 'Enter') {
            setPreviewUrl(e.target.value);
            handleRefresh();
        }
    }, [handleRefresh]);

    const toggleFullscreen = useCallback(() => {
        setIsFullscreen(!isFullscreen);
    }, [isFullscreen]);

    if (!hasFiles) {
        return (
            <div className="h-full flex items-center justify-center bg-board-bgSecondary">
                <div className="text-center space-y-3">
                    <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto">
                        <svg className="w-7 h-7 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-sm font-normal text-gray-400">No preview available</p>
                        <p className="text-xs text-gray-300 mt-1 font-normal">Generate code to see the live preview</p>
                    </div>
                </div>
            </div>
        );
    }

    const wrapperClasses = isFullscreen
        ? 'fixed inset-0 z-50 bg-white flex flex-col'
        : 'h-full flex flex-col overflow-hidden';

    return (
        <div className={wrapperClasses}>
            {/* ── Preview Toolbar ──────────────────────────── */}
            <div className="h-9 border-b border-board-border bg-board-bgSecondary flex items-center gap-2 px-3 shrink-0">
                <div className="flex items-center gap-1.5 mr-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-green-400"></span>
                </div>

                <button className="p-1 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors" title="Back">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <button className="p-1 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors" title="Forward">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                </button>

                <button onClick={handleRefresh}
                    className="p-1 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                    title="Refresh Preview">
                    <svg className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                </button>

                <div className="flex-1 mx-1">
                    <div className="flex items-center gap-1.5 bg-white rounded-md border border-gray-200 px-2.5 py-1">
                        <svg className="w-3 h-3 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <input type="text" value={previewUrl}
                            onChange={(e) => setPreviewUrl(e.target.value)}
                            onKeyDown={handleUrlChange}
                            className="flex-1 text-[11px] text-gray-600 bg-transparent border-none outline-none font-mono font-normal"
                            placeholder="/" />
                    </div>
                </div>

                <button onClick={toggleFullscreen}
                    className="p-1 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                    title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}>
                    {isFullscreen ? (
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
                        </svg>
                    ) : (
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                        </svg>
                    )}
                </button>
            </div>

            {/* ── Sandpack Preview ─────────────────────────── */}
            <div className="flex-1 bg-white relative min-h-0">
                <SandpackProvider
                    key={effectiveKey}
                    template="vite-react"
                    files={sandpackFiles}
                    theme="light"
                    customSetup={{
                        dependencies: customDependencies
                    }}
                    options={{
                        externalResources: [
                            'https://cdn.tailwindcss.com',
                            'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
                        ],
                        autorun: true,
                        autoReload: true,
                    }}
                >
                    <SandpackLoadingWatcher onLoaded={handleSandpackLoaded} />
                    <SandpackPreview
                        showOpenInCodeSandbox={false}
                        showRefreshButton={false}
                        style={{ height: '100%', border: 'none' }}
                        actionsChildren={null}
                    />
                </SandpackProvider>

                {/* Loading Overlay - dismisses once Sandpack is ready */}
                {isLoading && (
                    <div className="absolute inset-0 bg-white/90 flex items-center justify-center pointer-events-none z-10">
                        <div className="flex flex-col items-center gap-3">
                            <svg className="w-6 h-6 animate-spin text-board-primary" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                            </svg>
                            <span className="text-sm text-gray-400 font-normal">Compiling preview...</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LivePreview;
