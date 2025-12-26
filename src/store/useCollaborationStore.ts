import { create } from 'zustand';

interface CollaborationStore {
  roomId: string | null;
  isCollaborating: boolean;
  setRoomId: (roomId: string | null) => void;
  setIsCollaborating: (isCollaborating: boolean) => void;
}

export const useCollaborationStore = create<CollaborationStore>((set) => ({
  roomId: null,
  isCollaborating: false,
  setRoomId: (roomId) => set({ roomId }),
  setIsCollaborating: (isCollaborating) => set({ isCollaborating }),
}));