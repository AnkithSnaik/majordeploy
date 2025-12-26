"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, Check, Users } from "lucide-react";
import { useCollaborationStore } from "@/store/useCollaborationStore";

interface CollaborationDialogProps {
  onClose: () => void;
}

export default function CollaborationDialog({ onClose }: CollaborationDialogProps) {
  const [roomId, setRoomIdInput] = useState("");
  const [copied, setCopied] = useState(false);
  const { setRoomId, setIsCollaborating } = useCollaborationStore();

  const generateRoomId = () => {
    const id = Math.random().toString(36).substring(2, 10);
    setRoomIdInput(id);
    return id;
  };

  const handleCreateRoom = () => {
    const id = generateRoomId();
    setRoomId(id);
    setIsCollaborating(true);
    onClose();
  };

  const handleJoinRoom = () => {
    if (roomId.trim()) {
      setRoomId(roomId.trim());
      setIsCollaborating(true);
      onClose();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-[#1e1e2e] rounded-2xl border border-white/10 p-6 w-full max-w-md"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <h2 className="text-xl font-semibold text-white">Start Collaborating</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleCreateRoom}
              className="w-full p-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-xl text-white font-medium transition-all"
            >
              Create New Room
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[#1e1e2e] text-gray-400">or</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Join Existing Room
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={roomId}
                  onChange={(e) => setRoomIdInput(e.target.value)}
                  placeholder="Enter room ID"
                  className="flex-1 px-4 py-2 bg-[#12121a] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
                {roomId && (
                  <button
                    onClick={copyToClipboard}
                    className="p-2 bg-[#12121a] border border-white/10 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    {copied ? (
                      <Check className="w-5 h-5 text-green-400" />
                    ) : (
                      <Copy className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                )}
              </div>
            </div>

            <button
              onClick={handleJoinRoom}
              disabled={!roomId.trim()}
              className="w-full p-3 bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-white font-medium transition-colors"
            >
              Join Room
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}