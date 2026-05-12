import { createContext, useContext, useEffect, useState } from 'react';
import { supabase, getPerfil, registrarLog, updatePerfil, loginWithEmailOrUsername, signOut } from '../services/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [perfil,  setPerfil]  = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Si Supabase no está configurado, no intentar conectar
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) cargarPerfil(session.user.id);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
      if (session?.user) cargarPerfil(session.user.id);
      else { setPerfil(null); setLoading(false); }
    });

    return () => subscription.unsubscribe();
  }, []);

  const cargarPerfil = async (userId) => {
    try {
      const data = await getPerfil(userId);
      setPerfil(data);
    } catch {
      setPerfil(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (identifier, password) => {
    const data = await loginWithEmailOrUsername(identifier, password);
    if (data?.user) {
      await registrarLog(data.user.id, 'login', 'Inicio de sesion exitoso');
      await updatePerfil(data.user.id, { ultimo_login: new Date().toISOString() });
    }
    return data;
  };

  const logout = async () => {
    if (user) await registrarLog(user.id, 'logout', 'Cierre de sesion');
    await signOut();
  };

  const isAdmin = perfil?.rol === 'admin';

  return (
    <AuthContext.Provider value={{ user, perfil, loading, isAdmin, login, logout, cargarPerfil }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
