import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Employee, UserRole } from '../types';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface AuthContextType {
  currentUser: Employee | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  hasPermission: (allowedRoles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const DEMO_OWNER: Employee = {
  id: 'owner1',
  username: 'owner',
  password: 'owner123', // In real app, this should be hashed
  name: 'John Doe',
  role: 'owner',
  active: true,
  createdAt: Date.now(),
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<Employee | null>(() => {
    const saved = localStorage.getItem('pos-current-user');
    return saved ? JSON.parse(saved) : null;
  });
  
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize demo owner if no employees exist
    const savedEmployees = localStorage.getItem('pos-employees');
    if (!savedEmployees) {
      localStorage.setItem('pos-employees', JSON.stringify([DEMO_OWNER]));
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('pos-current-user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('pos-current-user');
    }
  }, [currentUser]);

  const login = async (username: string, password: string) => {
    const employees: Employee[] = JSON.parse(localStorage.getItem('pos-employees') || '[]');
    const employee = employees.find(
      e => e.username === username && e.password === password && e.active
    );

    if (employee) {
      setCurrentUser(employee);
      toast.success(`Selamat datang, ${employee.name}`);
      navigate('/');
    } else {
      throw new Error('Username atau password salah');
    }
  };

  const logout = () => {
    setCurrentUser(null);
    navigate('/login');
    toast.success('Berhasil logout');
  };

  const hasPermission = (allowedRoles: UserRole[]) => {
    if (!currentUser) return false;
    return allowedRoles.includes(currentUser.role);
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
