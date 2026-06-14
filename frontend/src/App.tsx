import { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { auth } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { Toaster } from 'sonner';

interface User {
  email: string;
  name: string;
  uid?: string;
  firstName?: string;
  lastNameParent?: string;
  lastNameMatch?: string;
  age?: number;
  phone?: string;
  createdAt?: any;
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Escuchar el estado de autenticación de Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Intentar obtener el perfil extendido de PostgreSQL a través del backend Express
          const response = await fetch(`/api/users/${firebaseUser.uid}`);
          
          if (response.ok) {
            const data = await response.json();
            setUser({
              email: firebaseUser.email || '',
              name: data.name || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Usuario',
              uid: firebaseUser.uid,
              firstName: data.firstName || '',
              lastNameParent: data.lastNameParent || '',
              lastNameMatch: data.lastNameMatch || '',
              age: data.age || undefined,
              phone: data.phone || '',
              createdAt: data.createdAt,
            });
          } else {
            setUser({
              email: firebaseUser.email || '',
              name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Usuario',
              uid: firebaseUser.uid,
            });
          }
        } catch (error) {
          console.warn("Backend no está disponible al iniciar (modo offline):", error);
          setUser({
            email: firebaseUser.email || '',
            name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Usuario',
            uid: firebaseUser.uid,
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
          <p className="text-emerald-800 font-medium text-sm">Cargando aplicación...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Dashboard 
        user={user}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />
      <Toaster position="top-right" richColors />
    </>
  );
}
