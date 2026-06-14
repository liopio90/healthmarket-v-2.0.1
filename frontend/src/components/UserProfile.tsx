import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeft, User, Mail, Phone, Calendar, 
  Edit3, Save, Shield, Activity, Sparkles, Loader2 
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { toast } from 'sonner';

interface UserData {
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

interface UserProfileProps {
  user: UserData | null;
  onBack: () => void;
  onUpdateUser: (newName: string) => void;
}

export function UserProfile({ user, onBack, onUpdateUser }: UserProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Datos locales para el formulario de edición
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastNameParent: '',
    lastNameMatch: '',
    phone: '',
    age: '',
  });

  // Cargar datos extendidos desde PostgreSQL al montar o cambiar el usuario
  useEffect(() => {
    async function fetchDetailedProfile() {
      if (!user?.uid) return;
      setLoadingProfile(true);
      try {
        const response = await fetch(`/api/users/${user.uid}`);
        
        if (response.ok) {
          const data = await response.json();
          setProfileData({
            firstName: data.firstName || '',
            lastNameParent: data.lastNameParent || '',
            lastNameMatch: data.lastNameMatch || '',
            phone: data.phone || '',
            age: data.age?.toString() || '',
          });
        } else {
          // Si no hay datos en la BD, rellenamos con lo que viene del objeto de autenticación
          const splitName = user.name.split(' ');
          setProfileData({
            firstName: splitName[0] || '',
            lastNameParent: splitName[1] || '',
            lastNameMatch: splitName.slice(2).join(' ') || '',
            phone: '',
            age: '',
          });
        }
      } catch (err) {
        console.warn("No se pudo obtener el perfil en tiempo real (modo offline).", err);
        const splitName = user.name.split(' ');
        setProfileData({
          firstName: splitName[0] || '',
          lastNameParent: splitName[1] || '',
          lastNameMatch: splitName.slice(2).join(' ') || '',
          phone: user.phone || '',
          age: user.age?.toString() || '',
        });
      } finally {
        setLoadingProfile(false);
      }
    }

    fetchDetailedProfile();
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid) return;

    // Validaciones básicas
    if (!profileData.firstName || !profileData.lastNameParent || !profileData.lastNameMatch) {
      toast.error('Los campos de nombre y apellidos son obligatorios');
      return;
    }

    setSaving(true);
    const fullName = `${profileData.firstName} ${profileData.lastNameParent} ${profileData.lastNameMatch}`.trim();
    
    const updatedPayload = {
      name: fullName,
      firstName: profileData.firstName,
      lastNameParent: profileData.lastNameParent,
      lastNameMatch: profileData.lastNameMatch,
      phone: profileData.phone,
      age: profileData.age ? parseInt(profileData.age, 10) : null,
      email: user.email,
      uid: user.uid,
    };

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPayload),
      });

      if (!response.ok) {
        throw new Error('Error al guardar en el servidor');
      }
      
      toast.success('¡Perfil actualizado con éxito!');
      onUpdateUser(fullName);
      setIsEditing(false);
    } catch (err: any) {
      console.error("Error al actualizar perfil en PostgreSQL:", err);
      toast.error('No se pudo guardar en el servidor. Intentando guardar localmente...');
      // Fallback local
      onUpdateUser(fullName);
      setIsEditing(false);
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <p className="text-gray-600 mb-4">Inicia sesión para ver tu perfil.</p>
        <Button onClick={onBack} className="bg-green-600 hover:bg-green-700">Volver al Inicio</Button>
      </div>
    );
  }

  // Obtener iniciales del avatar
  const getInitials = () => {
    const nameToSplit = isEditing 
      ? `${profileData.firstName} ${profileData.lastNameParent}` 
      : user.name;
    const parts = nameToSplit.split(' ').filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return parts[0] ? parts[0][0].toUpperCase() : 'U';
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-16">
      {/* Banner Superior Decorativo */}
      <div className="relative h-48 md:h-64 bg-gradient-to-r from-green-500 via-emerald-600 to-teal-700 overflow-hidden shadow-inner">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        <div className="container mx-auto px-4 h-full flex items-end pb-6 relative z-10">
          <button
            onClick={onBack}
            className="absolute top-6 left-4 md:left-8 bg-white/20 hover:bg-white/35 text-white backdrop-blur px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-semibold transition-all border border-white/20 active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </button>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="container mx-auto px-4 -mt-16 md:-mt-24 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Tarjeta Lateral de Avatar/Resumen */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="shadow-xl border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-b from-transparent to-gray-50/50 pt-8 pb-6 flex flex-col items-center border-b border-gray-100">
                <div className="relative mb-4 group">
                  <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center text-white text-3xl font-extrabold shadow-lg border-4 border-white transform transition-transform group-hover:scale-105">
                    {getInitials()}
                  </div>
                  <div className="absolute bottom-1 right-1 bg-green-500 text-white p-1.5 rounded-full border border-white shadow">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 text-center px-4">
                  {isEditing ? `${profileData.firstName} ${profileData.lastNameParent}` : user.name}
                </h3>
                <p className="text-gray-500 text-sm mt-1">{user.email}</p>
                
                <div className="mt-4 flex flex-wrap gap-2 justify-center">
                  <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full border border-green-200 flex items-center gap-1.5">
                    <Shield className="w-3 h-3" />
                    Cliente Verificado
                  </span>
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200 flex items-center gap-1.5">
                    <Activity className="w-3 h-3" />
                    Vida Activa
                  </span>
                </div>
              </div>
              
              <CardContent className="py-6 space-y-4 text-sm text-gray-600">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-700">Estado de cuenta:</span>
                  <span className="text-green-600 font-semibold">Activo</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-700">Tipo de Acceso:</span>
                  <span className="text-gray-500 capitalize">{user.email.endsWith('@gmail.com') ? 'Google Account' : 'Correo y Contraseña'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-700">Rol:</span>
                  <span className="text-gray-500">Miembro</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Panel Principal - Formulario e Info */}
          <div className="lg:col-span-2">
            <Card className="shadow-xl border-gray-100 h-full">
              <CardHeader className="border-b border-gray-100 flex flex-row items-center justify-between space-y-0 py-6">
                <div>
                  <CardTitle className="text-2xl font-extrabold text-gray-900">Perfil de Usuario</CardTitle>
                  <CardDescription className="text-sm text-gray-500">Administra tus datos de registro y contacto</CardDescription>
                </div>
                {!isEditing && (
                  <Button 
                    onClick={() => setIsEditing(true)} 
                    variant="outline" 
                    className="flex items-center gap-2 border-gray-200 hover:bg-gray-50 text-gray-700 active:scale-95 transition-all"
                  >
                    <Edit3 className="w-4 h-4 text-green-600" />
                    Editar Perfil
                  </Button>
                )}
              </CardHeader>

              {loadingProfile ? (
                <div className="py-24 flex flex-col items-center justify-center text-gray-500">
                  <Loader2 className="w-10 h-10 animate-spin text-green-500 mb-4" />
                  <p className="text-sm font-medium">Cargando perfil...</p>
                </div>
              ) : (
                <form onSubmit={handleSave}>
                  <CardContent className="py-8 space-y-6">
                    {isEditing ? (
                      /* Modo Edición */
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Nombres *</label>
                            <Input
                              name="firstName"
                              value={profileData.firstName}
                              onChange={handleInputChange}
                              placeholder="Nombres"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Apellido Paterno *</label>
                            <Input
                              name="lastNameParent"
                              value={profileData.lastNameParent}
                              onChange={handleInputChange}
                              placeholder="Apellido Paterno"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Apellido Materno *</label>
                            <Input
                              name="lastNameMatch"
                              value={profileData.lastNameMatch}
                              onChange={handleInputChange}
                              placeholder="Apellido Materno"
                              required
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Teléfono</label>
                            <Input
                              type="tel"
                              name="phone"
                              value={profileData.phone}
                              onChange={handleInputChange}
                              placeholder="Ej. 7443508109"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Edad</label>
                            <Input
                              type="number"
                              name="age"
                              value={profileData.age}
                              onChange={handleInputChange}
                              placeholder="Ej. 25"
                              min="1"
                              max="120"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Modo Lectura */
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          
                          <div className="flex items-center gap-4 p-4 bg-gray-50/50 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
                              <User className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Nombre Completo</p>
                              <p className="font-semibold text-gray-800 text-sm md:text-base mt-0.5">{user.name}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 p-4 bg-gray-50/50 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
                              <Mail className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Correo Electrónico</p>
                              <p className="font-semibold text-gray-800 text-sm md:text-base mt-0.5">{user.email}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 p-4 bg-gray-50/50 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
                              <Phone className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Teléfono de contacto</p>
                              <p className="font-semibold text-gray-800 text-sm md:text-base mt-0.5">
                                {profileData.phone ? profileData.phone : <span className="text-gray-400 italic">No especificado</span>}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 p-4 bg-gray-50/50 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
                              <Calendar className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Edad</p>
                              <p className="font-semibold text-gray-800 text-sm md:text-base mt-0.5">
                                {profileData.age ? `${profileData.age} años` : <span className="text-gray-400 italic">No especificada</span>}
                              </p>
                            </div>
                          </div>

                        </div>
                      </div>
                    )}
                  </CardContent>

                  {isEditing && (
                    <CardFooter className="bg-gray-50/50 px-6 py-4 flex justify-end gap-3 border-t border-gray-100">
                      <Button 
                        type="button" 
                        variant="ghost" 
                        onClick={() => setIsEditing(false)} 
                        disabled={saving}
                        className="text-gray-500 hover:text-gray-700 active:scale-95"
                      >
                        Cancelar
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={saving}
                        className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 px-6 active:scale-95 shadow-md"
                      >
                        {saving ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Guardando...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            Guardar Cambios
                          </>
                        )}
                      </Button>
                    </CardFooter>
                  )}
                </form>
              )}
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
}
