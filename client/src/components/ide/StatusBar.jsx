import React from 'react';

const StatusBar = ({ activeFile, fileSystem, version, generationPhase, deployedUrl, validationPassed }) => {
    const fileCount = fileSystem ? Object.keys(fileSystem).length : 0;
    const language = activeFile ? getLanguageLabel(activeFile) : '';

    const statusLabels = {
        idle: null,
        blueprint: 'Stage 1: Generating blueprint...',
        codegen: 'Stage 2→4→5: Building + Debugging + Walkthrough...',
        deploying: 'Stage 6: Deploying...'
    };

    const statusText = statusLabels[generationPhase];

    return (
        <div className="h-7 bg-white border-t border-gray-200 flex items-center justify-between px-3 text-[11px] text-gray-400 font-normal shrink-0 select-none">
            {/* Left */}
            <div className="flex items-center gap-3">
                {statusText && (
                    <span className="flex items-center gap-1.5 text-board-primary">
                        <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                        </svg>
                        {statusText}
                    </span>
                )}
                {!statusText && deployedUrl && (
                    <a
                        href={deployedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-green-500 hover:text-green-600 transition-colors"
                    >
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                        Live
                    </a>
                )}
                <span>{fileCount} files</span>
                {version > 1 && <span>v{version}</span>}

                {/* Validation Status */}
                {validationPassed !== undefined && validationPassed !== null && (
                    <span className={`flex items-center gap-1 ${validationPassed ? 'text-emerald-500' : 'text-amber-500'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${validationPassed ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
                        {validationPassed ? 'Checks passed' : 'Issues found'}
                    </span>
                )}
            </div>

            {/* Right */}
            <div className="flex items-center gap-3">
                {/* Pipeline indicator */}
                {!statusText && fileCount > 0 && (
                    <span className="flex items-center gap-1.5 text-gray-400">
                        <span className="text-[10px]">Pipeline:</span>
                        <span className="flex items-center gap-0.5">
                            <span className="w-1 h-1 rounded-full bg-emerald-400" title="Stage 1: Blueprint"></span>
                            <span className="w-1 h-1 rounded-full bg-emerald-400" title="Stage 2: Codegen"></span>
                            <span className="w-1 h-1 rounded-full bg-emerald-400" title="Stage 4: Debugger"></span>
                            <span className="w-1 h-1 rounded-full bg-emerald-400" title="Stage 5: Walkthrough"></span>
                        </span>
                    </span>
                )}
                {language && <span>{language}</span>}
                <span>UTF-8</span>
            </div>
        </div>
    );
};

function getLanguageLabel(filePath) {
    const ext = filePath?.split('.').pop()?.toLowerCase();
    const map = {
        js: 'JavaScript',
        jsx: 'React JSX',
        ts: 'TypeScript',
        tsx: 'React TSX',
        json: 'JSON',
        css: 'CSS',
        scss: 'SCSS',
        html: 'HTML',
        md: 'Markdown',
        env: 'Environment',
    };
    return map[ext] || ext?.toUpperCase() || '';
}

export default StatusBar;
