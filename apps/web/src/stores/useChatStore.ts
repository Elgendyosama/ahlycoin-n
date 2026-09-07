import { create } from 'zustand';
import { MatchChatMessage } from '@sports-social/types';

export interface Friend {
  id: string;
  name: string;
  username: string;
  avatarUrl: string;
  isOnline: boolean;
  favoriteTeam?: {
    name: string;
    logoUrl: string;
    code: string;
  };
}

export interface DirectMessage {
  id: string;
  senderId: string;
  senderName: string;
  recipientId: string;
  message: string;
  mediaType?: 'image' | 'audio';
  mediaUrl?: string;
  audioDuration?: number;
  timestamp: number;
}

interface ChatStoreState {
  // Floating DM Chat State
  isOpen: boolean;
  isMinimized: boolean;
  selectedFriend: Friend | null;
  unreadCount: number;
  friends: Friend[];
  directMessages: Record<string, DirectMessage[]>; // Keyed by friendId

  // Dedicated Match Chat State (isolated)
  activeMatchId: string | null;
  matchMessages: MatchChatMessage[];

  setFriends: (friends: Friend[]) => void;
  // DM Actions
  toggleChat: () => void;
  openChatWithFriend: (friend: Friend) => void;
  closeChat: () => void;
  setMinimized: (minimized: boolean) => void;
  setSelectedFriend: (friend: Friend | null) => void;
  addDirectMessage: (msg: DirectMessage, currentUserId?: string) => void;
  clearUnread: () => void;

  // Match Chat Actions
  setActiveMatchId: (matchId: string | null) => void;
  addMatchMessage: (msg: MatchChatMessage) => void;
  setMatchMessages: (messages: MatchChatMessage[]) => void;
}

export const MOCK_FRIENDS: Friend[] = [
  {
    id: 'friend-1',
    name: 'أحمد محمود',
    username: 'ahmed_mahmoud',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmed',
    isOnline: true,
    favoriteTeam: {
      name: 'Al Ahly',
      code: 'AHL',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/8/8c/Al_Ahly_SC_logo.svg',
    },
  },
  {
    id: 'friend-2',
    name: 'عمر الشريف',
    username: 'omar_elsherif',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Omar',
    isOnline: true,
    favoriteTeam: {
      name: 'Real Madrid',
      code: 'RMA',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg',
    },
  },
  {
    id: 'friend-3',
    name: 'سارة حسن',
    username: 'sara_hassan',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sara',
    isOnline: true,
    favoriteTeam: {
      name: 'Al Ahly',
      code: 'AHL',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/8/8c/Al_Ahly_SC_logo.svg',
    },
  },
  {
    id: 'friend-4',
    name: 'كريم عبد الله',
    username: 'karim_abdallah',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Karim',
    isOnline: false,
    favoriteTeam: {
      name: 'Arsenal',
      code: 'ARS',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/5/53/Arsenal_FC.svg',
    },
  },
];

export const useChatStore = create<ChatStoreState>((set, get) => ({
  isOpen: false,
  isMinimized: false,
  selectedFriend: MOCK_FRIENDS[0],
  unreadCount: 0,
  friends: MOCK_FRIENDS,
  directMessages: {
    'friend-1': [
      {
        id: 'dm-1',
        senderId: 'friend-1',
        senderName: 'أحمد محمود',
        recipientId: 'current-user',
        message: 'مستعد لمباراة الأهلي القادمة؟ 🔥',
        timestamp: Date.now() - 1000 * 60 * 15,
      },
      {
        id: 'dm-2',
        senderId: 'current-user',
        senderName: 'Me',
        recipientId: 'friend-1',
        message: 'أكيد! تشكيلة قوية جداً اليوم ⚽',
        timestamp: Date.now() - 1000 * 60 * 10,
      },
    ],
    'friend-2': [
      {
        id: 'dm-3',
        senderId: 'friend-2',
        senderName: 'عمر الشريف',
        recipientId: 'current-user',
        message: 'توقعك للنتيجة كم؟',
        timestamp: Date.now() - 1000 * 60 * 30,
      },
    ],
  },
  activeMatchId: null,
  matchMessages: [
    {
      id: 'init-1',
      matchId: 'match-1',
      userId: 'user-100',
      username: 'محمد علي',
      avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=Mohamed',
      badge: 'VIP الأهلي',
      message: 'هدف عالمي من الأهلي! ⚽🔥',
      timestamp: Date.now() - 1000 * 60 * 5,
    },
    {
      id: 'init-2',
      matchId: 'match-1',
      userId: 'user-101',
      username: 'خالد السعيد',
      avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=Khaled',
      badge: 'مشجع أهلاوي',
      message: 'الضغط العالي ممتاز جداً في الشوط الثاني 👍',
      timestamp: Date.now() - 1000 * 60 * 2,
    },
  ],

  setFriends: (newFriends: Friend[]) => set({ friends: newFriends }),

  toggleChat: () => {
    const { isOpen, isMinimized, selectedFriend, friends } = get();
    if (!isOpen) {
      set({
        isOpen: true,
        isMinimized: false,
        unreadCount: 0,
        selectedFriend: selectedFriend || friends[0] || null,
      });
    } else {
      set({ isMinimized: !isMinimized, unreadCount: 0 });
    }
  },

  openChatWithFriend: (friend: Friend) => {
    set({
      isOpen: true,
      isMinimized: false,
      selectedFriend: friend,
      unreadCount: 0,
    });
  },

  closeChat: () => set({ isOpen: false }),

  setMinimized: (minimized: boolean) => set({ isMinimized: minimized }),

  setSelectedFriend: (friend: Friend | null) => set({ selectedFriend: friend }),

  addDirectMessage: (msg: DirectMessage, currentUserId?: string) => {
    set((state) => {
      const otherPersonId = msg.senderId === currentUserId ? msg.recipientId : msg.senderId;
      const existing = state.directMessages[otherPersonId] || [];

      // Deduplicate by message ID
      if (existing.some((m) => m.id === msg.id)) {
        return state;
      }

      const updatedMessages = {
        ...state.directMessages,
        [otherPersonId]: [...existing, msg],
      };

      const isChatVisible = state.isOpen && !state.isMinimized && state.selectedFriend?.id === otherPersonId;
      const newUnread = isChatVisible || msg.senderId === currentUserId ? state.unreadCount : state.unreadCount + 1;

      return {
        directMessages: updatedMessages,
        unreadCount: newUnread,
      };
    });
  },

  clearUnread: () => set({ unreadCount: 0 }),

  setActiveMatchId: (matchId: string | null) => set({ activeMatchId: matchId }),

  addMatchMessage: (msg: MatchChatMessage) => {
    set((state) => {
      if (state.matchMessages.some((m) => m.id === msg.id)) {
        return state;
      }
      return {
        matchMessages: [...state.matchMessages, msg],
      };
    });
  },

  setMatchMessages: (messages: MatchChatMessage[]) => set({ matchMessages: messages }),
}));

