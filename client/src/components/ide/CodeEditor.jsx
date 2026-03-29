import React, { useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { VscClose, VscCircleFilled } from 'react-icons/vsc';
import { SiJavascript, SiReact } from 'react-icons/si';
import { VscJson, VscMarkdown, VscCode } from 'react-icons/vsc';

const getLanguage = (filePath) => {
    if (!filePath) return 'plaintext';
    const ext = filePath.split('.').pop()?.toLowerCase();
    const map = {
        js: 'javascript', mjs: 'javascript',
        jsx: 'javascript', tsx: 'typescript',
        ts: 'typescript',
        json: 'json',
        css: 'css', scss: 'scss',
        html: 'html',
        md: 'markdown',
        env: 'plaintext',
        yml: 'yaml', yaml: 'yaml'
    };
    return map[ext] || 'plaintext';
};

const getTabIcon = (fileName) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    const cls = 'w-3.5 h-3.5 flex-shrink-0';
    switch (ext) {
        case 'jsx': case 'tsx': return <SiReact className={`${cls} text-sky-500`} />;
        case 'js': case 'mjs': return <SiJavascript className={`${cls} text-yellow-500`} />;
        case 'json': return <VscJson className={`${cls} text-yellow-600`} />;
        case 'css': return <VscCode className={`${cls} text-blue-500`} />;
        case 'md': return <VscMarkdown className={`${cls} text-blue-400`} />;
        default: return <VscCode className={`${cls} text-gray-400`} />;
    }
};

const CodeEditorPanel = ({ activeFile, fileContent, openFiles, unsavedFiles, onContentChange, onSelectFile, onCloseFile }) => {
    const handleEditorChange = useCallback((value) => {
        if (onContentChange) onContentChange(value || '');
    }, [onContentChange]);

    const fileName = activeFile ? activeFile.split('/').pop() : '';

    return (
        <div className="h-full flex flex-col bg-white">
            {/* Tab Bar */}
            <div className="h-10 bg-gray-50 border-b border-gray-200 flex items-center overflow-x-auto scrollbar-hide shrink-0">
                {openFiles.map(file => {
                    const tabName = file.split('/').pop();
                    const isActive = file === activeFile;
                    const isUnsaved = unsavedFiles?.has?.(file);

                    return (
                        <div
                            key={file}
                            onClick={() => onSelectFile(file)}
                            className={`group flex items-center gap-1.5 px-3 h-full text-[12px] cursor-pointer border-r border-gray-200 transition-colors duration-150 min-w-0 shrink-0
                                ${isActive
                                    ? 'bg-white text-board-textMain border-b-2 border-b-board-primary'
                                    : 'text-gray-500 hover:bg-gray-100 hover:text-board-textMain border-b-2 border-b-transparent'
                                }`}
                        >
                            {getTabIcon(tabName)}
                            <span className="truncate max-w-[120px] font-normal">{tabName}</span>
                            {isUnsaved && (
                                <VscCircleFilled className="w-2 h-2 text-board-primary flex-shrink-0" />
                            )}
                            <button
                                onClick={(e) => { e.stopPropagation(); onCloseFile(file); }}
                                className="ml-1 p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-gray-200 transition-opacity"
                            >
                                <VscClose className="w-3 h-3" />
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Editor */}
            <div className="flex-1 relative">
                {activeFile ? (
                    <Editor
                        height="100%"
                        language={getLanguage(activeFile)}
                        value={fileContent}
                        onChange={handleEditorChange}
                        theme="vs"
                        options={{
                            fontSize: 13,
                            fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
                            fontWeight: '400',
                            lineHeight: 20,
                            minimap: { enabled: false },
                            scrollBeyondLastLine: false,
                            padding: { top: 12 },
                            wordWrap: 'on',
                            automaticLayout: true,
                            tabSize: 2,
                            renderWhitespace: 'none',
                            lineNumbers: 'on',
                            lineNumbersMinChars: 3,
                            folding: true,
                            bracketPairColorization: { enabled: true },
                            smoothScrolling: true,
                            cursorBlinking: 'smooth',
                            cursorSmoothCaretAnimation: 'on',
                            roundedSelection: true,
                            overviewRulerBorder: false,
                            hideCursorInOverviewRuler: true,
                            scrollbar: {
                                verticalScrollbarSize: 6,
                                horizontalScrollbarSize: 6,
                            }
                        }}
                    />
                ) : (
                    <div className="h-full flex items-center justify-center bg-gray-50/50">
                        <div className="text-center">
                            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                                <VscCode className="w-7 h-7 text-gray-300" />
                            </div>
                            <p className="text-sm text-gray-400 font-normal">Select a file to edit</p>
                            <p className="text-xs text-gray-300 mt-1 font-normal">Use the file explorer on the left</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CodeEditorPanel;
