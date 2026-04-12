import React, { useRef, useCallback, useState, useMemo } from 'react';
import Editor from '@monaco-editor/react';

/* ── Language detection from file extension ───────────── */
const getLanguage = (filePath) => {
    if (!filePath) return 'plaintext';
    const ext = filePath.split('.').pop()?.toLowerCase();
    const map = {
        js: 'javascript', jsx: 'javascript', ts: 'typescript', tsx: 'typescript',
        json: 'json', html: 'html', css: 'css', scss: 'scss',
        md: 'markdown', py: 'python', env: 'plaintext', gitignore: 'plaintext',
        yml: 'yaml', yaml: 'yaml', xml: 'xml', svg: 'xml',
    };
    return map[ext] || 'plaintext';
};

/* ── File icon helper ─────────────────────────────────── */
const getTabIcon = (fileName) => {
    const ext = fileName?.split('.').pop()?.toLowerCase();
    switch (ext) {
        case 'jsx': case 'tsx': return <span className="w-3 h-3 rounded-sm bg-sky-500/20 text-sky-600 text-[8px] flex items-center justify-center font-medium">R</span>;
        case 'js': case 'mjs': return <span className="w-3 h-3 rounded-sm bg-yellow-500/20 text-yellow-600 text-[8px] flex items-center justify-center font-medium">J</span>;
        case 'css': case 'scss': return <span className="w-3 h-3 rounded-sm bg-blue-500/20 text-blue-600 text-[8px] flex items-center justify-center font-medium">#</span>;
        case 'json': return <span className="w-3 h-3 rounded-sm bg-amber-500/20 text-amber-600 text-[8px] flex items-center justify-center font-medium">{'{}'}</span>;
        case 'html': return <span className="w-3 h-3 rounded-sm bg-orange-500/20 text-orange-600 text-[8px] flex items-center justify-center font-medium">H</span>;
        case 'md': return <span className="w-3 h-3 rounded-sm bg-blue-400/20 text-blue-500 text-[8px] flex items-center justify-center font-medium">M</span>;
        default: return <span className="w-3 h-3 rounded-sm bg-gray-200 text-gray-500 text-[8px] flex items-center justify-center font-medium">F</span>;
    }
};

const CodeEditor = ({
    activeFile,
    fileContent,
    openFiles,
    unsavedFiles,
    onSelectFile,
    onCloseFile,
    onCloseAllFiles,
    onContentChange,
    onSave,
}) => {
    const editorRef = useRef(null);
    const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 });
    const [showMinimap, setShowMinimap] = useState(false);
    const [wordWrap, setWordWrap] = useState('on');

    const language = useMemo(() => getLanguage(activeFile), [activeFile]);
    const fileName = useMemo(() => activeFile?.split('/').pop() || '', [activeFile]);

    // Breadcrumb path segments
    const breadcrumbs = useMemo(() => {
        if (!activeFile) return [];
        return activeFile.split('/');
    }, [activeFile]);

    const handleEditorMount = useCallback((editor) => {
        editorRef.current = editor;
        // Track cursor position
        editor.onDidChangeCursorPosition((e) => {
            setCursorPosition({ line: e.position.lineNumber, column: e.position.column });
        });
        // Keyboard shortcut: Save
        editor.addCommand(2048 | 49 /* Ctrl+S */, () => {
            if (onSave) onSave();
        });
    }, [onSave]);

    const handleEditorChange = useCallback((value) => {
        if (onContentChange) onContentChange(value || '');
    }, [onContentChange]);

    // Editor toolbar actions
    const handleFormat = useCallback(() => {
        if (editorRef.current) {
            editorRef.current.getAction('editor.action.formatDocument')?.run();
        }
    }, []);

    const handleFindReplace = useCallback(() => {
        if (editorRef.current) {
            editorRef.current.getAction('editor.action.startFindReplaceAction')?.run();
        }
    }, []);

    const toggleMinimap = useCallback(() => {
        const next = !showMinimap;
        setShowMinimap(next);
        if (editorRef.current) {
            editorRef.current.updateOptions({ minimap: { enabled: next } });
        }
    }, [showMinimap]);

    const toggleWordWrap = useCallback(() => {
        const next = wordWrap === 'on' ? 'off' : 'on';
        setWordWrap(next);
        if (editorRef.current) {
            editorRef.current.updateOptions({ wordWrap: next });
        }
    }, [wordWrap]);

    return (
        <div className="h-full flex flex-col bg-white overflow-hidden">
            {/* ── Tab Bar ────────────────────────────────── */}
            <div className="h-[34px] bg-board-bgSecondary border-b border-board-border flex items-center shrink-0 overflow-hidden">
                <div className="flex-1 flex items-center overflow-x-auto scrollbar-hide">
                    {openFiles.map((filePath) => {
                        const name = filePath.split('/').pop();
                        const isActive = filePath === activeFile;
                        const isUnsaved = unsavedFiles?.has?.(filePath);
                        return (
                            <div
                                key={filePath}
                                onClick={() => onSelectFile(filePath)}
                                className={`flex items-center gap-1.5 px-3 h-full cursor-pointer border-r border-board-border group transition-all shrink-0 ${
                                    isActive
                                        ? 'bg-white text-board-textMain border-b-2 border-b-board-primary'
                                        : 'text-gray-500 hover:bg-gray-50 border-b-2 border-b-transparent'
                                }`}
                            >
                                {getTabIcon(name)}
                                <span className="text-[12px] font-normal whitespace-nowrap">{name}</span>
                                {isUnsaved && (
                                    <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" title="Unsaved changes" />
                                )}
                                <button
                                    onClick={(e) => { e.stopPropagation(); onCloseFile(filePath); }}
                                    className="w-4 h-4 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-gray-200 transition-all shrink-0"
                                >
                                    <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        );
                    })}
                </div>
                {/* Close All */}
                {openFiles.length > 1 && (
                    <button
                        onClick={onCloseAllFiles}
                        className="px-2 h-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors border-l border-board-border shrink-0"
                        title="Close All"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </div>

            {/* ── Toolbar + Breadcrumb ────────────────────── */}
            {activeFile && (
                <div className="h-7 bg-white border-b border-board-border flex items-center justify-between px-3 shrink-0">
                    {/* Breadcrumbs */}
                    <div className="flex items-center gap-1 text-[11px] overflow-hidden">
                        {breadcrumbs.map((part, i) => (
                            <React.Fragment key={i}>
                                {i > 0 && <span className="text-gray-300">/</span>}
                                <span className={i === breadcrumbs.length - 1 ? 'text-board-textMain font-medium' : 'text-gray-400 font-normal'}>
                                    {part}
                                </span>
                            </React.Fragment>
                        ))}
                    </div>

                    {/* Toolbar Buttons */}
                    <div className="flex items-center gap-0.5">
                        <button
                            onClick={handleFindReplace}
                            className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                            title="Find & Replace (Ctrl+H)"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </button>
                        <button
                            onClick={handleFormat}
                            className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                            title="Format Document"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h8m-8 6h16" />
                            </svg>
                        </button>
                        <button
                            onClick={toggleWordWrap}
                            className={`p-1 rounded transition-colors ${wordWrap === 'on' ? 'text-board-primary bg-blue-50' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'}`}
                            title={`Word Wrap: ${wordWrap}`}
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h10a2 2 0 012 2v0a2 2 0 01-2 2H9m-6 0h6m-6-4h18" />
                            </svg>
                        </button>
                        <button
                            onClick={toggleMinimap}
                            className={`p-1 rounded transition-colors ${showMinimap ? 'text-board-primary bg-blue-50' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'}`}
                            title={`Minimap: ${showMinimap ? 'On' : 'Off'}`}
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
                            </svg>
                        </button>
                        <button
                            onClick={onSave}
                            className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                            title="Save (Ctrl+S)"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}

            {/* ── Monaco Editor ──────────────────────────── */}
            <div className="flex-1 min-h-0">
                {activeFile ? (
                    <Editor
                        key={activeFile}
                        height="100%"
                        language={language}
                        value={fileContent}
                        onChange={handleEditorChange}
                        onMount={handleEditorMount}
                        theme="vs"
                        options={{
                            fontSize: 13,
                            fontFamily: "'JetBrains Mono', 'Fira Code', Menlo, monospace",
                            fontLigatures: true,
                            tabSize: 2,
                            minimap: { enabled: showMinimap },
                            wordWrap,
                            smoothScrolling: true,
                            cursorBlinking: 'smooth',
                            cursorSmoothCaretAnimation: 'on',
                            lineNumbers: 'on',
                            renderWhitespace: 'selection',
                            bracketPairColorization: { enabled: true },
                            formatOnPaste: true,
                            scrollBeyondLastLine: false,
                            folding: true,
                            foldingStrategy: 'indentation',
                            quickSuggestions: { other: true, strings: true },
                            padding: { top: 8 },
                        }}
                    />
                ) : (
                    <div className="h-full flex items-center justify-center text-gray-400">
                        <div className="text-center space-y-3">
                            <svg className="w-12 h-12 mx-auto text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                            </svg>
                            <div>
                                <p className="text-sm font-normal text-gray-400">Select a file to edit</p>
                                <p className="text-xs text-gray-300 mt-1 font-normal">or press <kbd className="bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded text-[10px] font-mono">Ctrl+P</kbd> to search</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Editor Footer (Cursor position, Language) ── */}
            {activeFile && (
                <div className="h-[22px] bg-board-bgSecondary border-t border-board-border flex items-center justify-between px-3 text-[10px] text-gray-500 shrink-0">
                    <div className="flex items-center gap-3">
                        <span>Ln {cursorPosition.line}, Col {cursorPosition.column}</span>
                        <span>Spaces: 2</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="capitalize">{language}</span>
                        <span>UTF-8</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CodeEditor;