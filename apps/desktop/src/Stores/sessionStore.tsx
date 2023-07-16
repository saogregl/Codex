import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface UserData {
  access_token: string
  token_type: string
  expires_in: number
  refresh_token: string
  user: User
  expires_at: number
}

export interface User {
  id: string
  aud: string
  role: string
  email: string
  email_confirmed_at: string
  phone: string
  confirmation_sent_at: string
  confirmed_at: string
  last_sign_in_at: string
  app_metadata: AppMetadata
  user_metadata: UserMetadata
  identities: Identity[]
  created_at: string
  updated_at: string
}

export interface AppMetadata {
  provider: string
  providers: string[]
}

export interface UserMetadata {
  first_name: string
  last_name: string
  platform: string
}

export interface Identity {
  id: string
  user_id: string
  identity_data: IdentityData
  provider: string
  last_sign_in_at: string
  created_at: string
  updated_at: string
}

export interface IdentityData {
  email: string
  sub: string
}

export interface userState {
  userSession: UserData | null | {}
  setCurrentSession: (by: UserData) => void
  invalidateCurrentSession: (by: void) => void
}



const useStore = create(
  persist(
    (set) => ({
      userSession: {},
      setCurrentSession(currentSession: any) {
        set((state) => ({
          ...state,
          userSession: currentSession,
        }));
      },
      invalidateCurrentSession() {
        set((state) => ({
          ...state,
          userSession: {},
        }));
      },
    }),
    {
      name: "user-storage", // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => sessionStorage), // (optional) by default, 'localStorage' is used
    }
  )
);

export default useStore;
