import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { VscChevronRight, VscChevronDown, VscJson, VscMarkdown, VscCode } from 'react-icons/vsc';
import { SiJavascript, SiReact } from 'react-icons/si';

/* ── File type icons ──────────────────────────────────── */
const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    const cls = 'w-4 h-4 flex-shrink-0';
    switch (ext) {
        case 'jsx': case 'tsx': return <SiReact className={`${cls} text-sky-500`} />;
        case 'js': case 'mjs': return <SiJavascript className={`${cls} text-yellow-500`} />;
        case 'json': return <VscJson className={`${cls} text-amber-500`} />;
        case 'css': case 'scss': return <VscCode className={`${cls} text-blue-500`} />;
        case 'html': return <VscCode className={`${cls} text-orange-500`} />;
        case 'md': return <VscMarkdown className={`${cls} text-blue-400`} />;
        case 'env': return <VscCode className={`${cls} text-green-500`} />;
        default: return <VscCode className={`${cls} text-gray-400`} />;
    }
};

/* ── Build tree from flat file paths ─────────────────── */
const buildTree = (filePaths) => {
    const root = {};
    filePaths.sort().forEach((filePath) => {
        const parts = filePath.split('/');
        let current = root;
        parts.forEach((part, i) => {
            if (!current[part]) {
                current[part] = i === parts.length - 1 ? null : {};
            }
            if (current[part] !== null) current = current[part];
        });
    });
    return root;
};

/* ── Count files in a tree node recursively ──────────── */
const countFilesInNode = (node) => {
    if (node === null) return 1;
    return Object.values(node).reduce((acc, child) => acc + countFilesInNode(child), 0);
};

/* ── Context Menu Component ──────────────────────────── */
const ContextMenu = ({ x, y, onClose, options }) => {
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) onClose();
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    return (
        <motion.div
            ref={menuRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.1 }}
            className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-xl py-1 min-w-[160px]"
            style={{ left: x, top: y }}
        >
            {options.map((opt, i) => (
                opt.separator ? (
                    <div key={i} className="my-1 border-t border-gray-100" />
                ) : (
                    <button
                        key={i}
                        onClick={() => { opt.action(); onClose(); }}
                        className={`w-full text-left px-3 py-1.5 text-[12px] font-normal flex items-center gap-2 transition-colors ${
                            opt.danger
                                ? 'text-red-600 hover:bg-red-50'
                                : 'text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                        {opt.icon && <span className="w-4 h-4 flex items-center justify-center opacity-60">{opt.icon}</span>}
                        {opt.label}
                        {opt.shortcut && <span className="ml-auto text-[10px] text-gray-400">{opt.shortcut}</span>}
                    </button>
                )
            ))}
        </motion.div>
    );
};

/* ── Inline Input for New File / Rename ──────────────── */
const InlineInput = ({ initialValue = '', onSubmit, onCancel, placeholder }) => {
    const [value, setValue] = useState(initialValue);
    const inputRef = useRef(null);

    useEffect(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
    }, []);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (value.trim()) onSubmit(value.trim());
        } else if (e.key === 'Escape') {
            onCancel();
        }
    };

    return (
        <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => { if (value.trim()) onSubmit(value.trim()); else onCancel(); }}
            placeholder={placeholder}
            className="w-full bg-blue-50 border border-board-primary rounded text-[12px] px-2 py-1 outline-none font-normal"
        />
    );
};

/* ── Tree Node Renderer ──────────────────────────────── */
const TreeNode = ({
    name, node, path, depth,
    activeFile, onSelectFile,
    expandedFolders, toggleFolder,
    onContextMenu, onCreateNewFile, editingPath, setEditingPath, onRename,
    filter
}) => {
    const isFile = node === null;
    const isExpanded = expandedFolders.has(path);
    const isActive = isFile && activeFile === path;

    // Filter logic: if filter is set, only show matching items
    if (filter) {
        if (isFile) {
            if (!name.toLowerCase().includes(filter.toLowerCase())) return null;
        } else {
            // For folders, check if any child matches
            const childPaths = Object.keys(node || {});
            const hasMatch = childPaths.some(child => {
                const childPath = `${path}/${child}`;
                if (node[child] === null) return child.toLowerCase().includes(filter.toLowerCase());
                return true; // Always show folders when filtering
            });
            if (!hasMatch) return null;
        }
    }

    const renderChildren = () => {
        if (isFile || !isExpanded || !node) return null;
        const entries = Object.entries(node);
        // Sort: folders first, then files
        const sorted = entries.sort((a, b) => {
            const aIsFolder = a[1] !== null;
            const bIsFolder = b[1] !== null;
            if (aIsFolder && !bIsFolder) return -1;
            if (!aIsFolder && bIsFolder) return 1;
            return a[0].localeCompare(b[0]);
        });

        return sorted.map(([childName, childNode]) => (
            <TreeNode
                key={`${path}/${childName}`}
                name={childName}
                node={childNode}
                path={`${path}/${childName}`}
                depth={depth + 1}
                activeFile={activeFile}
                onSelectFile={onSelectFile}
                expandedFolders={expandedFolders}
                toggleFolder={toggleFolder}
                onContextMenu={onContextMenu}
                onCreateNewFile={onCreateNewFile}
                editingPath={editingPath}
                setEditingPath={setEditingPath}
                onRename={onRename}
                filter={filter}
            />
        ));
    };

    const handleClick = () => {
        if (isFile) onSelectFile(path);
        else toggleFolder(path);
    };

    const isEditing = editingPath === path;

    return (
        <div>
            <div
                onClick={handleClick}
                onContextMenu={(e) => onContextMenu(e, path, isFile)}
                className={`flex items-center gap-1.5 py-[3px] pr-2 cursor-pointer group transition-colors ${
                    isActive
                        ? 'bg-blue-50/80 text-board-primary'
                        : 'text-gray-600 hover:bg-gray-50'
                }`}
                style={{ paddingLeft: `${depth * 14 + 8}px` }}
            >
                {/* Chevron for folders */}
                {!isFile ? (
                    <span className="w-4 h-4 flex items-center justify-center shrink-0">
                        {isExpanded
                            ? <VscChevronDown className="w-3.5 h-3.5 text-gray-400" />
                            : <VscChevronRight className="w-3.5 h-3.5 text-gray-400" />
                        }
                    </span>
                ) : (
                    <span className="w-4 h-4 shrink-0" />
                )}

                {/* Icon */}
                {isFile ? getFileIcon(name) : (
                    <svg className="w-4 h-4 shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        {isExpanded
                            ? <path strokeLinecap="round" strokeLinejoin="round" d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h5l2 2h5a2 2 0 012 2v8a2 2 0 01-2 2H5z" />
                            : <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                        }
                    </svg>
                )}

                {/* Name */}
                {isEditing ? (
                    <InlineInput
                        initialValue={name}
                        onSubmit={(newName) => { onRename(path, newName); setEditingPath(null); }}
                        onCancel={() => setEditingPath(null)}
                        placeholder="Enter name"
                    />
                ) : (
                    <span className="text-[12px] truncate font-normal leading-none">{name}</span>
                )}

                {/* File count badge for folders */}
                {!isFile && node && (
                    <span className="ml-auto text-[9px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        {countFilesInNode(node)}
                    </span>
                )}
            </div>
            {renderChildren()}
        </div>
    );
};

/* ── Main File Explorer Component ────────────────────── */
const FileExplorer = ({ fileSystem, activeFile, onSelectFile, onCreateFile, onDeleteFile, onRenameFile }) => {
    const [expandedFolders, setExpandedFolders] = useState(new Set(['client', 'server', 'client/src']));
    const [contextMenu, setContextMenu] = useState(null);
    const [newFileInput, setNewFileInput] = useState(null); // { parentPath, type: 'file' | 'folder' }
    const [editingPath, setEditingPath] = useState(null);
    const [filterText, setFilterText] = useState('');
    const [showFilter, setShowFilter] = useState(false);

    const filePaths = useMemo(() => Object.keys(fileSystem || {}), [fileSystem]);
    const tree = useMemo(() => buildTree(filePaths), [filePaths]);
    const fileCount = filePaths.length;

    const toggleFolder = (path) => {
        setExpandedFolders(prev => {
            const newSet = new Set(prev);
            if (newSet.has(path)) newSet.delete(path);
            else newSet.add(path);
            return newSet;
        });
    };

    const expandAll = () => {
        const allFolders = new Set();
        filePaths.forEach(fp => {
            const parts = fp.split('/');
            for (let i = 1; i < parts.length; i++) {
                allFolders.add(parts.slice(0, i).join('/'));
            }
        });
        setExpandedFolders(allFolders);
    };

    const collapseAll = () => setExpandedFolders(new Set());

    const handleContextMenu = (e, path, isFile) => {
        e.preventDefault();
        e.stopPropagation();
        setContextMenu({
            x: e.clientX,
            y: e.clientY,
            path,
            isFile,
        });
    };

    const getContextMenuOptions = () => {
        if (!contextMenu) return [];
        const { path, isFile } = contextMenu;
        const parentPath = isFile ? path.substring(0, path.lastIndexOf('/')) : path;

        const options = [];
        if (!isFile) {
            options.push({
                label: 'New File',
                icon: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" /></svg>,
                action: () => setNewFileInput({ parentPath, type: 'file' }),
            });
            options.push({ separator: true });
        }
        options.push({
            label: 'Rename',
            icon: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>,
            action: () => setEditingPath(path),
        });
        options.push({
            label: 'Delete',
            icon: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
            action: () => {
                if (isFile && onDeleteFile) {
                    if (window.confirm(`Delete "${path.split('/').pop()}"?`)) {
                        onDeleteFile(path);
                    }
                }
            },
            danger: true,
        });

        return options;
    };

    const handleNewFileSubmit = (name) => {
        if (!newFileInput || !onCreateFile) return;
        const fullPath = newFileInput.parentPath ? `${newFileInput.parentPath}/${name}` : name;
        onCreateFile(fullPath);
        setNewFileInput(null);
        // Ensure parent folder is expanded
        if (newFileInput.parentPath) {
            setExpandedFolders(prev => new Set([...prev, newFileInput.parentPath]));
        }
    };

    const handleRename = (oldPath, newName) => {
        if (!onRenameFile) return;
        const parts = oldPath.split('/');
        parts[parts.length - 1] = newName;
        const newPath = parts.join('/');
        if (newPath !== oldPath) onRenameFile(oldPath, newPath);
    };

    return (
        <div className="h-full flex flex-col bg-white overflow-hidden">
            {/* Header */}
            <div className="h-9 border-b border-board-border flex items-center justify-between px-3 shrink-0">
                <div className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                    <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Explorer</span>
                    <span className="text-[10px] text-gray-400 ml-1">{fileCount}</span>
                </div>
                <div className="flex items-center gap-0.5">
                    {/* New File Button */}
                    <button
                        onClick={() => setNewFileInput({ parentPath: '', type: 'file' })}
                        className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                        title="New File"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                    </button>
                    {/* Search Button */}
                    <button
                        onClick={() => setShowFilter(!showFilter)}
                        className={`p-1 rounded transition-colors ${showFilter ? 'text-board-primary bg-blue-50' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'}`}
                        title="Filter Files"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </button>
                    {/* Collapse All */}
                    <button
                        onClick={collapseAll}
                        className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                        title="Collapse All"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                        </svg>
                    </button>
                    {/* Expand All */}
                    <button
                        onClick={expandAll}
                        className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                        title="Expand All"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Filter Input */}
            <AnimatePresence>
                {showFilter && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="border-b border-board-border overflow-hidden"
                    >
                        <div className="px-2 py-1.5">
                            <input
                                type="text"
                                value={filterText}
                                onChange={(e) => setFilterText(e.target.value)}
                                placeholder="Filter files..."
                                className="w-full bg-gray-50 border border-gray-200 rounded text-[12px] px-2 py-1 outline-none focus:border-board-primary font-normal"
                                autoFocus
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* New File Input (root level) */}
            {newFileInput && newFileInput.parentPath === '' && (
                <div className="px-2 py-1 border-b border-board-border">
                    <InlineInput
                        placeholder="Enter file path (e.g. client/src/NewFile.jsx)"
                        onSubmit={handleNewFileSubmit}
                        onCancel={() => setNewFileInput(null)}
                    />
                </div>
            )}

            {/* File Tree */}
            <div className="flex-1 overflow-y-auto py-1 scrollbar-hide">
                {filePaths.length === 0 ? (
                    <div className="px-4 py-8 text-center">
                        <svg className="w-8 h-8 mx-auto text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                        <p className="text-[11px] text-gray-400 font-normal">No files yet</p>
                        <p className="text-[10px] text-gray-400 mt-0.5 font-normal">Generate code to populate</p>
                    </div>
                ) : (
                    Object.entries(tree)
                        .sort((a, b) => {
                            const aIsFolder = a[1] !== null;
                            const bIsFolder = b[1] !== null;
                            if (aIsFolder && !bIsFolder) return -1;
                            if (!aIsFolder && bIsFolder) return 1;
                            return a[0].localeCompare(b[0]);
                        })
                        .map(([name, node]) => (
                            <TreeNode
                                key={name}
                                name={name}
                                node={node}
                                path={name}
                                depth={0}
                                activeFile={activeFile}
                                onSelectFile={onSelectFile}
                                expandedFolders={expandedFolders}
                                toggleFolder={toggleFolder}
                                onContextMenu={handleContextMenu}
                                onCreateNewFile={handleNewFileSubmit}
                                editingPath={editingPath}
                                setEditingPath={setEditingPath}
                                onRename={handleRename}
                                filter={filterText}
                            />
                        ))
                )}
            </div>

            {/* Context Menu */}
            <AnimatePresence>
                {contextMenu && (
                    <ContextMenu
                        x={contextMenu.x}
                        y={contextMenu.y}
                        onClose={() => setContextMenu(null)}
                        options={getContextMenuOptions()}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default FileExplorer;
