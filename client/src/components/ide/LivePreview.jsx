import React, { useMemo, useState } from 'react';
import { SandpackProvider, SandpackLayout, SandpackPreview } from '@codesandbox/sandpack-react';
import { VscDesktopDownload, VscDeviceMobile } from 'react-icons/vsc';
import { HiOutlineDeviceTablet } from 'react-icons/hi2';
import { motion } from 'framer-motion';

/**
 * Extracts client-side files from the VFS and maps them for Sandpack.
 * Sandpack expects files keyed like "/App.jsx", "/index.css", etc.
 */
const mapFilesForSandpack = (fileSystem) => {
    if (!fileSystem) return {};

    const sandpackFiles = {};

    for (const [path, content] of Object.entries(fileSystem)) {
        if (path.startsWith('client/')) {
            let sandpackPath = path.substring(6); // e.g., 'client/src/App.jsx' -> '/src/App.jsx'

            // Rewrite Vite structures into native CRA structure for crash-proof Sandpack Webpack
            if (sandpackPath === '/index.html') sandpackPath = '/public/index.html';
            else if (sandpackPath === '/src/main.jsx') sandpackPath = '/src/index.js';

            sandpackFiles[sandpackPath] = { code: content || '' };
        }
    }

    // Ensure essential fallback exists
    if (!sandpackFiles['/src/App.jsx'] && !sandpackFiles['/src/App.js']) {
        sandpackFiles['/src/App.jsx'] = {
            code: `import React from 'react';\n\nexport default function App() {\n  return (\n    <div style={{ fontFamily: 'Inter, sans-serif', padding: '2rem', textAlign: 'center' }}>\n      <h1 style={{ fontSize: '1.5rem', color: '#1F2937' }}>App Preview</h1>\n      <p style={{ color: '#64748B', marginTop: '0.5rem' }}>Your generated app will appear here</p>\n    </div>\n  );\n}`
        };
    }

    return sandpackFiles;
};

const LivePreview = ({ fileSystem, previewKey }) => {
    const [viewMode, setViewMode] = useState('desktop'); // desktop | tablet | mobile

    const sandpackFiles = useMemo(() => mapFilesForSandpack(fileSystem), [fileSystem]);
    const hasFiles = Object.keys(sandpackFiles).length > 0;

    const viewWidths = {
        desktop: '100%',
        tablet: '768px',
        mobile: '375px'
    };

    if (!hasFiles) {
        return (
            <div className="h-full flex items-center justify-center bg-gray-50/50">
                <div className="text-center">
                    <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                        <svg className="w-7 h-7 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <p className="text-sm text-gray-400 font-normal">No preview available</p>
                    <p className="text-xs text-gray-300 mt-1 font-normal">Generate code to see a live preview</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-white">
            {/* Preview Header */}
            <div className="h-10 bg-gray-50 border-b border-gray-200 flex items-center justify-between px-3 shrink-0">
                <span className="text-xs text-gray-500 font-normal flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                    Live Preview
                </span>
                <div className="flex items-center gap-1 bg-white rounded-lg border border-gray-200 p-0.5">
                    <button
                        onClick={() => setViewMode('desktop')}
                        className={`p-1 rounded transition-colors ${viewMode === 'desktop' ? 'bg-board-primary/10 text-board-primary' : 'text-gray-400 hover:text-gray-600'}`}
                        title="Desktop"
                    >
                        <VscDesktopDownload className="w-3.5 h-3.5" />
                    </button>
                    <button
                        onClick={() => setViewMode('tablet')}
                        className={`p-1 rounded transition-colors ${viewMode === 'tablet' ? 'bg-board-primary/10 text-board-primary' : 'text-gray-400 hover:text-gray-600'}`}
                        title="Tablet"
                    >
                        <HiOutlineDeviceTablet className="w-3.5 h-3.5" />
                    </button>
                    <button
                        onClick={() => setViewMode('mobile')}
                        className={`p-1 rounded transition-colors ${viewMode === 'mobile' ? 'bg-board-primary/10 text-board-primary' : 'text-gray-400 hover:text-gray-600'}`}
                        title="Mobile"
                    >
                        <VscDeviceMobile className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {/* Preview Content */}
            <div className="flex-1 overflow-hidden flex items-stretch justify-center bg-[#F8F9FA] p-0 md:p-2">
                <motion.div
                    key={viewMode}
                    initial={{ opacity: 0.8, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2 }}
                    className="bg-white shadow-sm overflow-hidden h-full flex flex-col w-full border-x border-gray-200"
                    style={{ maxWidth: viewMode === 'desktop' ? '100%' : viewWidths[viewMode], margin: '0 auto' }}
                >
                    <SandpackProvider
                        key={previewKey}
                        template="react"
                        files={sandpackFiles}
                        theme="light"
                        options={{
                            externalResources: ["https://cdn.tailwindcss.com"]
                        }}
                        customSetup={{
                            dependencies: {
                                "lucide-react": "latest",
                                "framer-motion": "latest",
                                "react-router-dom": "latest",
                                "zustand": "latest"
                            }
                        }}
                    >
                        <SandpackLayout style={{ height: '100%', border: 'none', borderRadius: 0 }}>
                            <SandpackPreview
                                showNavigator={true}
                                showOpenInCodeSandbox={false}
                                showRefreshButton={true}
                                style={{ height: '100%' }}
                            />
                        </SandpackLayout>
                    </SandpackProvider>
                </motion.div>
            </div>
        </div>
    );
};

export default LivePreview;