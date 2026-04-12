import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { VscJson, VscMarkdown, VscCode } from 'react-icons/vsc';
import { SiJavascript, SiReact } from 'react-icons/si';

const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    const cls = 'w-4 h-4 flex-shrink-0';
    switch (ext) {
        case 'jsx': case 'tsx': return <SiReact className={`${cls} text-sky-500`} />;
        case 'js': case 'mjs': return <SiJavascript className={`${cls} text-yellow-500`} />;
        case 'json': return <VscJson className={`${cls} text-yellow-600`} />;
        case 'css': case 'scss': return <VscCode className={`${cls} text-blue-500`} />;
        case 'html': return <VscCode className={`${cls} text-orange-500`} />;
        case 'md': return <VscMarkdown className={`${cls} text-blue-400`} />;
        default: return <VscCode className={`${cls} text-gray-400`} />;
    }
};

/**
 * Fuzzy match: checks if the query characters appear in order in the target string.
 * Returns a score (lower = better match), or -1 if no match.
 */
const fuzzyMatch = (query, target) => {
    const q = query.toLowerCase();
    const t = target.toLowerCase();
    let qi = 0;
    let score = 0;
    let lastMatchIdx = -1;

    for (let ti = 0; ti < t.length && qi < q.length; ti++) {
        if (t[ti] === q[qi]) {
            // Bonus for consecutive matches
            if (lastMatchIdx === ti - 1) score -= 5;
            // Bonus for matching at segment starts (after / or .)
            if (ti === 0 || t[ti - 1] === '/' || t[ti - 1] === '.') score -= 10;
            lastMatchIdx = ti;
            qi++;
        }
        score += 1;
    }

    return qi === q.length ? score : -1;
};

const QuickOpen = ({ isOpen, onClose, fileSystem, recentFiles, onSelectFile }) => {
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef(null);
    const listRef = useRef(null);

    // Focus input when opened
    useEffect(() => {
        if (isOpen) {
            setQuery('');
            setSelectedIndex(0);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isOpen]);

    // All file paths from the VFS
    const allFiles = useMemo(() => {
        if (!fileSystem) return [];
        return Object.keys(fileSystem);
    }, [fileSystem]);

    // Filtered and ranked results
    const results = useMemo(() => {
        if (!query.trim()) {
            // Show recent files first, then all files
            const recent = (recentFiles || []).filter(f => allFiles.includes(f));
            const rest = allFiles.filter(f => !recent.includes(f));
            return [...recent.map(f => ({ path: f, isRecent: true })), ...rest.map(f => ({ path: f, isRecent: false }))].slice(0, 30);
        }

        const scored = allFiles
            .map(path => {
                const fileName = path.split('/').pop();
                // Match against both full path and filename
                const pathScore = fuzzyMatch(query, path);
                const nameScore = fuzzyMatch(query, fileName);
                const bestScore = nameScore >= 0
                    ? (pathScore >= 0 ? Math.min(pathScore, nameScore - 20) : nameScore - 20)
                    : pathScore;
                return { path, score: bestScore, isRecent: false };
            })
            .filter(r => r.score >= 0)
            .sort((a, b) => a.score - b.score);

        return scored.slice(0, 20);
    }, [query, allFiles, recentFiles]);

    // Scroll selected item into view
    useEffect(() => {
        if (listRef.current) {
            const selectedEl = listRef.current.children[selectedIndex];
            if (selectedEl) selectedEl.scrollIntoView({ block: 'nearest' });
        }
    }, [selectedIndex]);

    // Reset index when results change
    useEffect(() => {
        setSelectedIndex(0);
    }, [results.length, query]);

    const handleKeyDown = useCallback((e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => Math.max(prev - 1, 0));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (results[selectedIndex]) {
                onSelectFile(results[selectedIndex].path);
                onClose();
            }
        } else if (e.key === 'Escape') {
            e.preventDefault();
            onClose();
        }
    }, [results, selectedIndex, onSelectFile, onClose]);

    // Highlight matching characters in the file path
    const highlightMatch = (text, q) => {
        if (!q) return <span>{text}</span>;
        const lower = text.toLowerCase();
        const lowerQ = q.toLowerCase();
        const parts = [];
        let qi = 0;
        let lastEnd = 0;

        for (let i = 0; i < text.length && qi < lowerQ.length; i++) {
            if (lower[i] === lowerQ[qi]) {
                if (i > lastEnd) parts.push(<span key={`t-${lastEnd}`} className="text-gray-400">{text.substring(lastEnd, i)}</span>);
                parts.push(<span key={`h-${i}`} className="text-board-primary font-medium">{text[i]}</span>);
                lastEnd = i + 1;
                qi++;
            }
        }
        if (lastEnd < text.length) parts.push(<span key={`t-${lastEnd}`} className="text-gray-400">{text.substring(lastEnd)}</span>);
        return <>{parts}</>;
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/30 backdrop-blur-sm"
                onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
            >
                <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden"
                >
                    {/* Search Input */}
                    <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
                        <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Search files by name..."
                            className="flex-1 text-sm bg-transparent border-none outline-none placeholder:text-gray-400 text-board-textMain font-normal"
                            autoComplete="off"
                        />
                        <kbd className="text-[10px] text-gray-400 bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded font-mono">ESC</kbd>
                    </div>

                    {/* Results */}
                    <div ref={listRef} className="max-h-[300px] overflow-y-auto py-1">
                        {results.length === 0 ? (
                            <div className="px-4 py-8 text-center text-sm text-gray-400">
                                No matching files found
                            </div>
                        ) : (
                            results.map((result, i) => {
                                const fileName = result.path.split('/').pop();
                                const dir = result.path.substring(0, result.path.length - fileName.length);
                                const isSelected = i === selectedIndex;

                                return (
                                    <div
                                        key={result.path}
                                        onClick={() => { onSelectFile(result.path); onClose(); }}
                                        onMouseEnter={() => setSelectedIndex(i)}
                                        className={`flex items-center gap-3 px-4 py-2 cursor-pointer transition-colors ${
                                            isSelected
                                                ? 'bg-board-primary/8 text-board-textMain'
                                                : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                    >
                                        {getFileIcon(fileName)}
                                        <div className="flex-1 min-w-0 flex items-center gap-2">
                                            <span className="text-[13px] truncate font-normal">
                                                {query ? highlightMatch(fileName, query) : fileName}
                                            </span>
                                            <span className="text-[11px] text-gray-400 truncate font-normal">
                                                {dir}
                                            </span>
                                        </div>
                                        {result.isRecent && (
                                            <span className="text-[9px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded shrink-0">
                                                recent
                                            </span>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-4 py-2 border-t border-gray-100 bg-gray-50/50 flex items-center gap-4 text-[10px] text-gray-400">
                        <span className="flex items-center gap-1">
                            <kbd className="bg-gray-100 border border-gray-200 px-1 py-px rounded font-mono">↑↓</kbd> navigate
                        </span>
                        <span className="flex items-center gap-1">
                            <kbd className="bg-gray-100 border border-gray-200 px-1 py-px rounded font-mono">↵</kbd> open
                        </span>
                        <span className="flex items-center gap-1">
                            <kbd className="bg-gray-100 border border-gray-200 px-1 py-px rounded font-mono">esc</kbd> close
                        </span>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default QuickOpen;
