"use client";
import { useCodeEditorStore } from "@/store/useCodeEditorStore";
import { useEffect, useState } from "react";
import { defineMonacoThemes, LANGUAGE_CONFIG } from "../_constants";
import { Editor } from "@monaco-editor/react";
import { motion } from "framer-motion";
import Image from "next/image";
import { RotateCcwIcon, ShareIcon, TypeIcon, Users, WifiOff, Wifi } from "lucide-react";
import { useClerk, useUser } from "@clerk/nextjs";
import { EditorPanelSkeleton } from "./EditorPanelSkeleton";
import useMounted from "@/hooks/useMounted";
import ShareSnippetDialog from "./ShareSnippetDialog";
import { useCollaborationStore } from "@/store/useCollaborationStore";
import CollaborationDialog from "./CollaborationDialog";
import { useCollaboration } from "../../../../hooks/useCollaboration";

function EditorPanel() {
  const clerk = useClerk();
  const { user } = useUser();
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isCollabDialogOpen, setIsCollabDialogOpen] = useState(false);
  const { language, theme, fontSize, editor, setFontSize, setEditor, setLanguage } = useCodeEditorStore();
  const { roomId, isCollaborating } = useCollaborationStore();

  const mounted = useMounted();

  const { users, isConnected, totalUsers } = useCollaboration({
    roomId: isCollaborating ? roomId : null,
    userId: user?.id || 'anonymous',
    username: user?.firstName || user?.username || 'Anonymous',
    editor,
    language,
    onCodeUpdate: (code) => {
      localStorage.setItem(`editor-code-${language}`, code);
    },
    onLanguageUpdate: (newLang) => {
      setLanguage(newLang);
    }
  });

  useEffect(() => {
    const savedCode = localStorage.getItem(`editor-code-${language}`);
    const newCode = savedCode || LANGUAGE_CONFIG[language].defaultCode;
    if (editor && !isCollaborating) editor.setValue(newCode);
  }, [language, editor, isCollaborating]);

  useEffect(() => {
    const savedFontSize = localStorage.getItem("editor-font-size");
    if (savedFontSize) setFontSize(parseInt(savedFontSize));
  }, [setFontSize]);

  const handleRefresh = () => {
    const defaultCode = LANGUAGE_CONFIG[language].defaultCode;
    if (editor) editor.setValue(defaultCode);
    localStorage.removeItem(`editor-code-${language}`);
  };

  const handleEditorChange = (value: string | undefined) => {
    if (value && !isCollaborating) {
      localStorage.setItem(`editor-code-${language}`, value);
    }
  };

  const handleFontSizeChange = (newSize: number) => {
    const size = Math.min(Math.max(newSize, 12), 24);
    setFontSize(size);
    localStorage.setItem("editor-font-size", size.toString());
  };

  if (!mounted) return null;

  return (
    <div className="relative">
      <div className="relative bg-[#12121a]/90 backdrop-blur rounded-xl border border-white/[0.05] p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#1e1e2e] ring-1 ring-white/5">
              <Image src={"/" + language + ".png"} alt="Logo" width={24} height={24} />
            </div>
            <div>
              <h2 className="text-sm font-medium text-white">Code Editor</h2>
              <p className="text-xs text-gray-500">
                {isCollaborating ? `Room: ${roomId}` : 'Write and execute your code'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Collaboration Status */}
            {isCollaborating && (
              <div className="flex items-center gap-2 px-3 py-2 bg-[#1e1e2e] rounded-lg ring-1 ring-white/5">
                {isConnected ? (
                  <Wifi className="w-4 h-4 text-green-400" />
                ) : (
                  <WifiOff className="w-4 h-4 text-red-400" />
                )}
                <span className="text-sm text-gray-400">{totalUsers} online</span>
                <div className="flex -space-x-2">
                  {users.slice(0, 3).map((u) => (
                    <div
                      key={u._id}
                      className="w-6 h-6 rounded-full ring-2 ring-[#1e1e2e] flex items-center justify-center text-xs font-medium text-white"
                      style={{ backgroundColor: u.color }}
                      title={u.username}
                    >
                      {u.username[0].toUpperCase()}
                    </div>
                  ))}
                  {users.length > 3 && (
                    <div className="w-6 h-6 rounded-full ring-2 ring-[#1e1e2e] bg-gray-600 flex items-center justify-center text-xs text-white">
                      +{users.length - 3}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Font Size Slider */}
            <div className="flex items-center gap-3 px-3 py-2 bg-[#1e1e2e] rounded-lg ring-1 ring-white/5">
              <TypeIcon className="size-4 text-gray-400" />
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="12"
                  max="24"
                  value={fontSize}
                  onChange={(e) => handleFontSizeChange(parseInt(e.target.value))}
                  className="w-20 h-1 bg-gray-600 rounded-lg cursor-pointer"
                />
                <span className="text-sm font-medium text-gray-400 min-w-[2rem] text-center">
                  {fontSize}
                </span>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              className="p-2 bg-[#1e1e2e] hover:bg-[#2a2a3a] rounded-lg ring-1 ring-white/5 transition-colors"
              aria-label="Reset to default code"
            >
              <RotateCcwIcon className="size-4 text-gray-400" />
            </motion.button>

            {/* Collaborate Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsCollabDialogOpen(true)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-opacity ${
                isCollaborating
                  ? 'bg-gradient-to-r from-green-500 to-green-600 opacity-90 hover:opacity-100'
                  : 'bg-gradient-to-r from-purple-500 to-purple-600 opacity-90 hover:opacity-100'
              }`}
            >
              <Users className="size-4 text-white" />
              <span className="text-sm font-medium text-white">
                {isCollaborating ? 'Connected' : 'Collaborate'}
              </span>
            </motion.button>

            {/* Share Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsShareDialogOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg overflow-hidden bg-gradient-to-r
               from-blue-500 to-blue-600 opacity-90 hover:opacity-100 transition-opacity"
            >
              <ShareIcon className="size-4 text-white" />
              <span className="text-sm font-medium text-white ">Share</span>
            </motion.button>
          </div>
        </div>

        {/* Editor  */}
        <div className="relative group rounded-xl overflow-hidden ring-1 ring-white/[0.05]">
          {clerk.loaded && (
            <Editor
              height="600px"
              language={LANGUAGE_CONFIG[language].monacoLanguage}
              onChange={handleEditorChange}
              theme={theme}
              beforeMount={defineMonacoThemes}
              onMount={(editor) => setEditor(editor)}
              options={{
                minimap: { enabled: false },
                fontSize,
                automaticLayout: true,
                scrollBeyondLastLine: false,
                padding: { top: 16, bottom: 16 },
                renderWhitespace: "selection",
                fontFamily: '"Fira Code", "Cascadia Code", Consolas, monospace',
                fontLigatures: true,
                cursorBlinking: "smooth",
                smoothScrolling: true,
                contextmenu: true,
                renderLineHighlight: "all",
                lineHeight: 1.6,
                letterSpacing: 0.5,
                roundedSelection: true,
                scrollbar: {
                  verticalScrollbarSize: 8,
                  horizontalScrollbarSize: 8,
                },
              }}
            />
          )}

          {!clerk.loaded && <EditorPanelSkeleton />}
        </div>
      </div>
      {isShareDialogOpen && <ShareSnippetDialog onClose={() => setIsShareDialogOpen(false)} />}
      {isCollabDialogOpen && <CollaborationDialog onClose={() => setIsCollabDialogOpen(false)} />}
    </div>
  );
}
export default EditorPanel;