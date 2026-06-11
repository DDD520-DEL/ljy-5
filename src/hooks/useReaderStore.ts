import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface ReaderState {
  nickname: string
  setNickname: (nickname: string) => void
}

export const useReaderStore = create<ReaderState>()(
  persist(
    (set) => ({
      nickname: '爱读书的猫',
      setNickname: (nickname) => set({ nickname }),
    }),
    {
      name: 'reader-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
