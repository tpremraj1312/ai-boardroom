import React, { useState, useMemo } from 'react';
import { VscFolder, VscFolderOpened, VscJson, VscMarkdown, VscCode } from 'react-icons/vsc';
import { SiJavascript, SiReact } from 'react-icons/si';
import { motion, AnimatePresence } from 'framer-motion';

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
 * Builds a nested tree structure from a flat file path list.
 */
const buildTree = (filePaths) => {
    const root = {};
    filePaths.forEach(path => {
        const parts = path.split('/');
        let current = root;
        parts.forEach((part, i) => {
            if (!current[part]) {
                current[part] = i === parts.length - 1 ? null : {};
            }
            if (current[part] !== null) {
                current = current[part];
            }
        });
    });
    return root;
};

const TreeNode = ({ name, node, path, depth, activeFile, onSelectFile, expandedFolders, toggleFolder }) => {
    const isFile = node === null;
    const isExpanded = expandedFolders.has(path);
    const isActive = activeFile === path;

    if (isFile) {
        return (
            <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.15 }}
                onClick={() => onSelectFile(path)}
                style={{ paddingLeft: `${depth * 16 + 12}px` }}
                className={`flex items-center gap-2 py-1.5 px-2 cursor-pointer text-[13px] transition-all duration-150 rounded-r-md mr-2
                    ${isActive
                        ? 'bg-board-primary/8 text-board-primary border-r-2 border-board-primary'
                        : 'text-board-textSecondary hover:bg-gray-100 hover:text-board-textMain'
                    }`}
            >
                {getFileIcon(name)}
                <span className="truncate font-normal">{name}</span>
            </motion.div>
        );
    }

    const children = Object.entries(node).sort(([, a], [, b]) => {
        if (a === null && b !== null) return 1;
        if (a !== null && b === null) return -1;
        return 0;
    });

    return (
        <div>
            <div
                onClick={() => toggleFolder(path)}
                style={{ paddingLeft: `${depth * 16 + 8}px` }}
                className="flex items-center gap-1.5 py-1.5 px-2 cursor-pointer text-[13px] text-board-textMain hover:bg-gray-50 transition-colors duration-150 select-none"
            >
                <svg
                    className={`w-3 h-3 text-gray-400 transition-transform duration-150 ${isExpanded ? 'rotate-90' : ''}`}
                    fill="currentColor" viewBox="0 0 20 20"
                >
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                {isExpanded
                    ? <VscFolderOpened className="w-4 h-4 text-board-primary/70 flex-shrink-0" />
                    : <VscFolder className="w-4 h-4 text-board-primary/50 flex-shrink-0" />
                }
                <span className="font-normal truncate">{name}</span>
            </div>
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="overflow-hidden"
                    >
                        {children.map(([childName, childNode]) => (
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
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const FileExplorer = ({ fileSystem, activeFile, onSelectFile }) => {
    const [expandedFolders, setExpandedFolders] = useState(new Set(['client', 'server', 'client/src', 'server/routes', 'server/models']));

    const tree = useMemo(() => {
        if (!fileSystem) return {};
        return buildTree(Object.keys(fileSystem));
    }, [fileSystem]);

    const toggleFolder = (path) => {
        setExpandedFolders(prev => {
            const next = new Set(prev);
            if (next.has(path)) next.delete(path);
            else next.add(path);
            return next;
        });
    };

    const topLevelEntries = Object.entries(tree).sort(([, a], [, b]) => {
        if (a === null && b !== null) return 1;
        if (a !== null && b === null) return -1;
        return 0;
    });

    const fileCount = fileSystem ? Object.keys(fileSystem).length : 0;

    return (
        <div className="h-full flex flex-col bg-white">
            <div className="px-4 py-3 border-b border-gray-100">
                <div className="flex items-center justify-between">
                    <span className="uppercase tracking-wider text-[10px] text-gray-400 font-normal">Explorer</span>
                    <span className="text-[10px] text-gray-400 font-normal">{fileCount} files</span>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto py-1">
                {fileCount === 0 ? (
                    <div className="px-4 py-8 text-center">
                        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
                            <VscFolder className="w-5 h-5 text-gray-300" />
                        </div>
                        <p className="text-xs text-gray-400 font-normal">No files yet</p>
                        <p className="text-[11px] text-gray-300 mt-1 font-normal">Generate code to populate</p>
                    </div>
                ) : (
                    topLevelEntries.map(([name, node]) => (
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
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default FileExplorer;
