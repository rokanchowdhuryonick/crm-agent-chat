export interface User {
    id: number;
    name: string;
    email: string;
    created_at: string;
    updated_at: string;
    // Add other user properties as needed
}

export interface RegisterData {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
  }

export interface AuthContextType {
    user: User | null;
    token: string | null;
    loading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<{success: boolean; error?: string}>;
    register: (userData: RegisterData) => Promise<{success: boolean; error?: string}>;
    logout: () => Promise<void>;
  }