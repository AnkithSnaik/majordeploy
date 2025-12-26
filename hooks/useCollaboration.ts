import { useEffect, useState, useRef } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { editor as MonacoEditor } from 'monaco-editor';

interface CollaborationUser {
  _id: string;
  userId: string;
  username: string;
  color: string;
}

interface UseCollaborationProps {
  roomId: string | null;
  userId: string;
  username: string;
  editor: MonacoEditor.IStandaloneCodeEditor | null;
  language: string;
  onCodeUpdate?: (code: string) => void;
  onLanguageUpdate?: (language: string) => void;
}

export function useCollaboration({
  roomId,
  userId,
  username,
  editor,
  language,
  onCodeUpdate,
  onLanguageUpdate
}: UseCollaborationProps) {
  const [isConnected, setIsConnected] = useState(false);
  const isRemoteChangeRef = useRef(false);
  const isLocalChangeRef = useRef(false);
  const isLanguageChangeRef = useRef(false);
  const lastRoomStateRef = useRef<{ code: string; language: string } | null>(null);

  const joinRoom = useMutation(api.collaboration.joinRoom);
  const leaveRoom = useMutation(api.collaboration.leaveRoom);
  const updateCode = useMutation(api.collaboration.updateCode);
  const updateLanguage = useMutation(api.collaboration.updateLanguage);
  
  const roomState = useQuery(
    api.collaboration.getRoomState,
    roomId ? { roomId } : "skip"
  );
  
  const roomUsers = useQuery(
    api.collaboration.getRoomUsers,
    roomId ? { roomId } : "skip"
  );

  // Join room
  useEffect(() => {
    if (!roomId || !userId) {
      setIsConnected(false);
      return;
    }

    let mounted = true;

    const join = async () => {
      try {
        await joinRoom({ roomId, userId, username });
        if (mounted) {
          setIsConnected(true);
          console.log('✅ Connected to room:', roomId);
        }
      } catch (error) {
        console.error('❌ Failed to join:', error);
        if (mounted) {
          setIsConnected(false);
        }
      }
    };

    join();

    return () => {
      mounted = false;
      leaveRoom({ roomId, userId }).catch(console.error);
      setIsConnected(false);
    };
  }, [roomId, userId, username, joinRoom, leaveRoom]);

  // Sync room state to editor
  useEffect(() => {
    if (!roomState || !editor || isLocalChangeRef.current) return;

    const currentCode = editor.getValue();
    const lastState = lastRoomStateRef.current;

    // Update code if it changed
    if (roomState.code !== currentCode && roomState.code !== lastState?.code) {
      isRemoteChangeRef.current = true;
      const position = editor.getPosition();
      const scrollTop = editor.getScrollTop();
      
      editor.setValue(roomState.code);
      
      if (position) {
        editor.setPosition(position);
        editor.setScrollTop(scrollTop);
      }
      
      if (onCodeUpdate) {
        onCodeUpdate(roomState.code);
      }
      
      setTimeout(() => {
        isRemoteChangeRef.current = false;
      }, 50);
    }

    // Update language if it changed
    if (roomState.language !== language && roomState.language !== lastState?.language && !isLanguageChangeRef.current) {
      isLanguageChangeRef.current = true;
      if (onLanguageUpdate) {
        onLanguageUpdate(roomState.language);
      }
      setTimeout(() => {
        isLanguageChangeRef.current = false;
      }, 100);
    }

    lastRoomStateRef.current = {
      code: roomState.code,
      language: roomState.language,
    };
  }, [roomState, editor, language, onCodeUpdate, onLanguageUpdate]);

  // Handle local code changes
  useEffect(() => {
    if (!editor || !roomId || !userId || !isConnected) return;

    const disposable = editor.onDidChangeModelContent(() => {
      if (isRemoteChangeRef.current) {
        return;
      }

      isLocalChangeRef.current = true;
      const code = editor.getValue();
      
      updateCode({ roomId, code, userId })
        .catch(console.error)
        .finally(() => {
          setTimeout(() => {
            isLocalChangeRef.current = false;
          }, 50);
        });
    });

    return () => {
      disposable.dispose();
    };
  }, [editor, roomId, userId, isConnected, updateCode]);

  // Handle local language changes
  useEffect(() => {
    if (!roomId || !userId || !language || !isConnected || isLanguageChangeRef.current) {
      return;
    }

    const lastState = lastRoomStateRef.current;
    if (lastState && lastState.language === language) {
      return;
    }

    updateLanguage({ roomId, language, userId }).catch(console.error);
  }, [language, roomId, userId, isConnected, updateLanguage]);

  const users = roomUsers?.filter(u => u.userId !== userId) || [];

  return { 
    users: users as CollaborationUser[], 
    isConnected,
    totalUsers: (roomUsers?.length || 0)
  };
}