import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingCart, User, Search, Menu, X, LogOut, ChevronDown,
  Calendar, Clock, Video, MapPin, CheckCircle, Star, Users,
  Target, Heart, Shield, Zap, Award, TrendingUp, Brain,
  Activity, Apple, Dumbbell, Filter, ArrowLeft, Plus, Minus,
  ShoppingCart as CartIcon, Share2, Truck, RefreshCw, ChevronLeft, ChevronRight,
  Mail, Lock, Eye, EyeOff, Phone, CreditCard, Trash2
} from 'lucide-react';
import { products } from '../data/products';
import { Product } from '../types/product';
import { ModernProductCard } from './ModernProductCard';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Badge } from './ui/badge';
import { ModernFooter } from './ModernFooter';
import { FloatingContact } from './FloatingContact';
import { DeviceFeatures } from './DeviceFeatures';
import { auth, googleProvider } from '../firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup 
} from 'firebase/auth';

type Page = 'inicio' | 'productos' | 'consultas' | 'sobre-nosotros' | 'plan-personalizado' | 'login' | 'checkout';

interface UserData {
  email: string;
  name: string;
}

interface CartItem {
  product: Product;
  quantity: number;
}

interface DashboardProps {
  user?: UserData | null;
  onLogin?: (user: UserData) => void;
  onLogout?: () => void;
}

export function Dashboard({ user, onLogin, onLogout }: DashboardProps) {
  const [currentPage, setCurrentPage] = useState<Page>('inicio');
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'nutrition' | 'reviews'>('description');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  const selectedProduct = products.find(p => p.id === selectedProductId);

  // Funciones del carrito
  const addToCart = (product: Product, qty: number = 1) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + qty }
            : item
        );
      }
      return [...prevCart, { product, quantity: qty }];
    });
    setCartOpen(true);
  };

  const updateCartQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prevCart =>
      prevCart.map(item =>
        item.product.id === productId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const removeFromCart = (productId: number) => {
    setCart(prevCart => prevCart.filter(item => item.product.id !== productId));
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      const price = parseFloat(item.product.price.replace('$', ''));
      return total + (price * item.quantity);
    }, 0);
  };

  const getCartItemsCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const handleProductClick = (productId: number) => {
    setSelectedProductId(productId);
    setCurrentPage('productos');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToProducts = () => {
    setSelectedProductId(null);
    setCurrentPage('productos');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page as Page);
    setSelectedProductId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Si hay un producto seleccionado, mostrar detalle
  if (selectedProduct) {
    return (
      <div className="min-h-screen bg-white">
        <Header 
          currentPage={currentPage} 
          onNavigate={handleNavigate}
          user={user}
          onLogin={onLogin}
          onLogout={onLogout}
          cartItemsCount={getCartItemsCount()}
          onCartClick={() => setCartOpen(true)}
        />
        <ProductDetail 
          product={selectedProduct} 
          onBack={handleBackToProducts}
          onAddToCart={(qty) => addToCart(selectedProduct, qty)}
          onAddProductToCart={addToCart}
        />
        <CartSidebar
          isOpen={cartOpen}
          onClose={() => setCartOpen(false)}
          cart={cart}
          onUpdateQuantity={updateCartQuantity}
          onRemoveItem={removeFromCart}
          onCheckout={() => {
            setCartOpen(false);
            setCurrentPage('checkout');
          }}
          total={getCartTotal()}
        />
        <ModernFooter />
        <FloatingContact />
      </div>
    );
  }

  // Renderizar página según currentPage
  return (
    <div className="min-h-screen bg-white">
      <Header 
        currentPage={currentPage} 
        onNavigate={handleNavigate}
        user={user}
        onLogin={onLogin}
        onLogout={onLogout}
        cartItemsCount={getCartItemsCount()}
        onCartClick={() => setCartOpen(true)}
      />
      
      {currentPage === 'inicio' && (
        <main>
          <HeroCarousel />
          <DeviceFeatures />
          <FeaturedProductsSection 
            onProductClick={handleProductClick}
            onAddToCart={addToCart}
          />
          <NutritionistSection />
          <AboutUsSection />
        </main>
      )}
      
      {currentPage === 'productos' && (
        <ProductsSection 
          onProductClick={handleProductClick}
          onAddToCart={addToCart}
        />
      )}
      
      {currentPage === 'consultas' && (
        <ConsultasSection 
          selectedType={selectedType}
          setSelectedType={setSelectedType}
          selectedDay={selectedDay}
          setSelectedDay={setSelectedDay}
          selectedTime={selectedTime}
          setSelectedTime={setSelectedTime}
        />
      )}
      
      {currentPage === 'sobre-nosotros' && (
        <SobreNosotrosSection />
      )}
      
      {currentPage === 'plan-personalizado' && (
        <PlanPersonalizadoSection />
      )}
      
      {currentPage === 'login' && (
        <LoginPage 
          onLogin={(loggedUser) => {
            onLogin?.(loggedUser);
            setCurrentPage('inicio');
          }}
          onBack={() => setCurrentPage('inicio')}
        />
      )}

      {currentPage === 'checkout' && (
        <CheckoutPage
          cart={cart}
          onBack={() => setCurrentPage('inicio')}
          onUpdateQuantity={updateCartQuantity}
          onRemoveItem={removeFromCart}
          total={getCartTotal()}
        />
      )}
      
      <CartSidebar
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={cart}
        onUpdateQuantity={updateCartQuantity}
        onRemoveItem={removeFromCart}
        onCheckout={() => {
          setCartOpen(false);
          setCurrentPage('checkout');
        }}
        total={getCartTotal()}
      />
      
      {currentPage !== 'login' && currentPage !== 'checkout' && (
        <>
          <ModernFooter />
          <FloatingContact />
        </>
      )}
    </div>
  );
}

// Header Component
function Header({ currentPage, onNavigate, user, onLogin, onLogout, cartItemsCount, onCartClick }: {
  currentPage: Page;
  onNavigate: (page: string) => void;
  user?: UserData | null;
  onLogin?: (user: UserData) => void;
  onLogout?: () => void;
  cartItemsCount?: number;
  onCartClick?: () => void;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const menuItems = [
    { id: 'productos', label: 'Productos' },
    { id: 'consultas', label: 'Consultas' },
    { id: 'plan-personalizado', label: 'Plan Personalizado' },
    { id: 'sobre-nosotros', label: 'Sobre Nosotros' }
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4">
       <div className="flex items-center justify-between h-20 md:h-24">
          <button 
            onClick={() => onNavigate('inicio')}
            className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent"
           
          >
            HEALTH MARKET
          </button>

          <nav className="hidden md:flex items-center gap-8">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`transition-colors ${
                  currentPage === item.id
                    ? 'text-green-600 font-semibold'
                    : 'text-gray-600 hover:text-green-600'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <button className="hidden md:flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors">
              <Search className="w-5 h-5" />
            </button>
            <button 
              onClick={onCartClick}
              className="hidden md:flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors relative"
            >
              <CartIcon className="w-5 h-5" />
              {cartItemsCount && cartItemsCount > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-green-600 text-white border-0">
                  {cartItemsCount}
                </Badge>
              )}
            </button>
            
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors"
                >
                  <User className="w-5 h-5" />
                  <span className="hidden md:block">{user.name}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                    <button
                      onClick={() => {
                        onLogout?.();
                        setUserMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => onNavigate('login')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Iniciar Sesión
              </button>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-gray-600"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`block w-full text-left px-4 py-2 transition-colors ${
                  currentPage === item.id
                    ? 'text-green-600 font-semibold'
                    : 'text-gray-600 hover:text-green-600'
                }`}
              >
                {item.label}
              </button>
            ))}
            <button
              onClick={() => {
                onCartClick?.();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 w-full text-left px-4 py-2 text-gray-600 hover:text-green-600 transition-colors"
            >
              <CartIcon className="w-5 h-5" />
              <span>Carrito</span>
              {cartItemsCount && cartItemsCount > 0 && (
                <Badge className="ml-auto bg-green-600 text-white border-0">
                  {cartItemsCount}
                </Badge>
              )}
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

// Login Page
function LoginPage({ onLogin, onBack }: { onLogin: (user: UserData) => void; onBack: () => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    edad: '',
    telefono: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const getFirebaseErrorMessage = (errorCode: string) => {
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'El correo electrónico ya está registrado.';
      case 'auth/invalid-email':
        return 'El correo electrónico no es válido o está mal redactado.';
      case 'auth/weak-password':
        return 'La contraseña debe tener al menos 6 caracteres.';
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'El correo o la contraseña son incorrectos.';
      case 'auth/popup-closed-by-user':
        return 'Se canceló el inicio de sesión con Google al cerrar la ventana emergente.';
      default:
        return 'Ocurrió un error al procesar tu solicitud. Inténtalo de nuevo.';
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const user = userCredential.user;
      let displayName = user.displayName || user.email?.split('@')[0] || 'Usuario';

      try {
        // Obtener o crear perfil en Firestore (opcional)
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (!userDocSnap.exists()) {
          await setDoc(userDocRef, {
            name: displayName,
            email: user.email || '',
            uid: user.uid,
            createdAt: serverTimestamp(),
          });
        } else {
          const data = userDocSnap.data();
          displayName = data.name || displayName;
        }
      } catch (firestoreError) {
        console.warn("Firestore no está inicializado o está inaccesible. Usando datos básicos de autenticación.", firestoreError);
      }

      onLogin({
        email: user.email || '',
        name: displayName,
      });
    } catch (err: any) {
      console.error(err);
      setError(getFirebaseErrorMessage(err.code || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        if (!formData.email || !formData.password) {
          setError('Por favor completa todos los campos');
          setLoading(false);
          return;
        }

        const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
        const user = userCredential.user;
        let displayName = user.displayName || formData.email.split('@')[0];

        try {
          // Obtener el nombre desde Firestore si existe (opcional)
          const userDocRef = doc(db, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            displayName = userDocSnap.data().name || displayName;
          }
        } catch (firestoreError) {
          console.warn("Firestore inaccesible al iniciar sesión. Usando datos básicos de autenticación.", firestoreError);
        }

        onLogin({
          email: user.email || '',
          name: displayName,
        });

        setFormData({ 
          email: '', 
          password: '', 
          name: '', 
          apellidoPaterno: '',
          apellidoMaterno: '',
          edad: '',
          telefono: '',
          confirmPassword: '' 
        });
      } else {
        if (formData.password !== formData.confirmPassword) {
          setError('Las contraseñas no coinciden');
          setLoading(false);
          return;
        }
        if (
          !formData.email || 
          !formData.password || 
          !formData.name || 
          !formData.apellidoPaterno || 
          !formData.apellidoMaterno || 
          !formData.edad || 
          !formData.telefono
        ) {
          setError('Por favor completa todos los campos obligatorios');
          setLoading(false);
          return;
        }

        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        const user = userCredential.user;
        const fullName = `${formData.name} ${formData.apellidoPaterno} ${formData.apellidoMaterno}`;

        try {
          // Guardar perfil en Firestore (opcional)
          await setDoc(doc(db, 'users', user.uid), {
            name: fullName,
            firstName: formData.name,
            lastNameParent: formData.apellidoPaterno,
            lastNameMatch: formData.apellidoMaterno,
            age: parseInt(formData.edad, 10),
            phone: formData.telefono,
            email: formData.email,
            uid: user.uid,
            createdAt: serverTimestamp(),
          });
        } catch (firestoreError) {
          console.warn("No se pudo guardar el perfil en Firestore. El usuario fue registrado en Auth de todas formas.", firestoreError);
        }

        onLogin({
          email: user.email || '',
          name: fullName,
        });

        setFormData({ 
          email: '', 
          password: '', 
          name: '', 
          apellidoPaterno: '',
          apellidoMaterno: '',
          edad: '',
          telefono: '',
          confirmPassword: '' 
        });
      }
    } catch (err: any) {
      console.error(err);
      setError(getFirebaseErrorMessage(err.code || err.message));
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setFormData({ 
      email: '', 
      password: '', 
      name: '', 
      apellidoPaterno: '',
      apellidoMaterno: '',
      edad: '',
      telefono: '',
      confirmPassword: '' 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-8 py-10 text-white text-center relative">
            <button
              onClick={onBack}
              type="button"
              className="absolute top-4 left-4 text-white/80 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-3xl font-bold mb-2">
              {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
            </h1>
            <p className="text-green-50">
              {isLogin
                ? 'Bienvenido de nuevo a Health Market'
                : 'Únete a Health Market y mejora tu bienestar'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Nombres *
                    </label>
                    <div className="relative isolate">
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="juan pablo"
                        className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                        required
                      />
                      <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-30" style={{ right: '12px' }} />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Apellido Paterno *
                    </label>
                    <div className="relative isolate">
                      <input
                        type="text"
                        value={formData.apellidoPaterno}
                        onChange={(e) => setFormData({ ...formData, apellidoPaterno: e.target.value })}
                        placeholder="Robledo"
                        className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                        required
                      />
                      <User className="absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-30" style={{ right: '12px' }} />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Apellido Materno *
                    </label>
                    <div className="relative isolate">
                      <input
                        type="text"
                        value={formData.apellidoMaterno}
                        onChange={(e) => setFormData({ ...formData, apellidoMaterno: e.target.value })}
                        placeholder="Mosqueda"
                        className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                        required
                      />
                      <User className="absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-30" style={{ right: '12px' }} />
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Edad *
                    </label>
                    <div className="relative isolate">
                      <input
                        type="number"
                        value={formData.edad}
                        onChange={(e) => setFormData({ ...formData, edad: e.target.value })}
                        placeholder="20"
                        min="1"
                        max="120"
                        className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                        required
                      />
                      <Calendar className="absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-30" style={{ right: '12px' }} />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Teléfono *
                    </label>
                    <div className="relative isolate">
                      <input
                        type="tel"
                        value={formData.telefono}
                        onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                        placeholder="7444589391"
                        className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                        required
                      />
                      <Phone className="absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-30" style={{ right: '12px' }} />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Correo electrónico *
              </label>
              <div className="relative isolate">
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="tu@gmail.com"
                  className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                  required
                />
                <Mail className="absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-30" style={{ right: '12px' }} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Contraseña *
              </label>
              <div className="relative isolate">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                  required
                />
                <Lock className="absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-30" style={{ right: '40px' }} />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors z-30"
                  style={{ right: '12px' }}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
              >
                <label className="text-sm font-medium text-gray-700">
                  Confirmar contraseña *
                </label>
                <div className="relative isolate">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="••••••••"
                    className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                    required
                  />
                  <Lock className="absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-30" style={{ right: '40px' }} />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors z-30"
                    style={{ right: '12px' }}
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              {loading ? 'Cargando...' : isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
            </button>

            {/* Divisor "O" */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-4 text-gray-400 font-semibold">O</span>
              </div>
            </div>

            {/* Botón de Google Sign-In */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-6 py-3.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors font-medium text-gray-700 shadow-sm active:scale-[0.99] disabled:opacity-50"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>Continuar con Google</span>
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={switchMode}
                className="text-sm text-gray-600 hover:text-green-600 transition-colors font-medium"
              >
                {isLogin
                  ? '¿No tienes cuenta? Regístrate aquí'
                  : '¿Ya tienes cuenta? Inicia sesión aquí'}
              </button>
            </div>
          </form>

        </motion.div>
      </div>
    </div>
  );
}

// Hero Carousel Section
function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const slides = [
    {
      title: "¡Ofertas de Temporada!",
      subtitle: "Hasta 40% OFF",
      description: "En toda nuestra línea de proteínas premium",
      bgGradient: "from-green-600 via-emerald-600 to-teal-600",
      buttonText: "Ver Ofertas",
      icon: "🏋️"
    },
    {
      title: "Nuevos Productos",
      subtitle: "Recién Llegados",
      description: "Descubre las últimas novedades en suplementos",
      bgGradient: "from-teal-600 via-cyan-600 to-blue-600",
      buttonText: "Explorar",
      icon: "✨"
    },
    {
      title: "Envío Gratis",
      subtitle: "En compras +$500",
      description: "Recibe tus productos en la puerta de tu casa",
      bgGradient: "from-emerald-600 via-green-600 to-lime-600",
      buttonText: "Comprar Ahora",
      icon: "🚚"
    },
    {
      title: "Plan Nutricional",
      subtitle: "Consulta Gratis",
      description: "Agenda tu cita con nuestro nutriólogo certificado",
      bgGradient: "from-green-700 via-emerald-600 to-green-500",
      buttonText: "Agendar Cita",
      icon: "🥗"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <section className="relative overflow-hidden bg-white">
      <div className="container mx-auto px-4 py-8">
        <div className="relative rounded-3xl overflow-hidden shadow-2xl">
          {/* Slides */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
              className="relative bg-green-500 py-12 md:py-16 lg:py-20 px-6 md:px-12"
            >
              <div className="relative z-10 text-center max-w-3xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full mb-4 shadow-md"
                >
                  <span className="text-2xl">{slides[currentSlide].icon}</span>
                  <span className="text-black font-bold">{slides[currentSlide].subtitle}</span>
                </motion.div>
                
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-black mb-4 tracking-tight"
                >
                  {slides[currentSlide].title}
                </motion.h2>
                
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-lg md:text-xl text-black mb-6"
                >
                  {slides[currentSlide].description}
                </motion.p>
                
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="px-8 py-4 bg-black text-white font-bold rounded-xl hover:bg-gray-800 hover:shadow-xl hover:scale-105 transition-all duration-300"
                >
                  {slides[currentSlide].buttonText}
                </motion.button>
              </div>

              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-white rounded-full hover:scale-110 transition-all shadow-md"
          >
            <ChevronLeft className="w-6 h-6 text-black" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-white rounded-full hover:scale-110 transition-all shadow-md"
          >
            <ChevronRight className="w-6 h-6 text-black" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide 
                    ? 'bg-black w-8' 
                    : 'bg-white hover:bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// Featured Products Section
function FeaturedProductsSection({ onProductClick, onAddToCart }: { 
  onProductClick: (id: number) => void;
  onAddToCart: (product: Product, quantity: number) => void;
}) {
  // Primero obtener productos con badge
  const productsWithBadge = products.filter(product => product.badge);
  
  // Luego obtener productos con mejor rating que no tengan badge
  const topRatedProducts = products
    .filter(product => !product.badge && product.rating >= 4.5)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 3); // Tomar hasta 3 productos adicionales
  
  // Combinar: primero los con badge, luego los mejor calificados
  const featuredProducts = [...productsWithBadge, ...topRatedProducts].slice(0, 5);

  if (featuredProducts.length === 0) return null;

  return (
    <section className="py-6 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full mb-4 text-base font-medium">
            <Star className="w-5 h-5 fill-green-600 text-green-600" />
            <span>Productos Destacados</span>
          </div>
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Lo más popular
            </h2>
            <p className="text-sm text-gray-600 max-w-2xl mx-auto">
              Descubre nuestros productos más vendidos y novedades seleccionadas especialmente para ti
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {featuredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <div
                onClick={() => onProductClick(product.id)}
                className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-0.5 group"
              >
                <div className="relative">
                  <div className="aspect-square overflow-hidden bg-gray-100 flex items-center justify-center p-6">
                    <ImageWithFallback
                      src={product.image}
                      alt={product.title}
                      className="max-w-[80px] max-h-[80px] w-full h-full object-contain object-center group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  {product.badge && (
                    <div className="absolute top-1.5 right-1.5">
                      <span className="px-1.5 py-0.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-[10px] font-semibold rounded-full shadow-sm">
                        {product.badge}
                      </span>
                    </div>
                  )}
                  <div className="absolute top-1.5 left-1.5">
                    <button className="p-1 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors">
                      <Heart className="w-3 h-3 text-gray-600 hover:text-red-500 transition-colors" />
                    </button>
                  </div>
                </div>
                <div className="p-2.5">
                  <div className="flex items-center gap-0.5 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-2.5 h-2.5 ${
                          i < Math.floor(product.rating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="text-[10px] text-gray-500 ml-0.5">({product.rating})</span>
                  </div>
                  <h3 className="text-xs font-bold text-gray-900 mb-1 group-hover:text-green-600 transition-colors line-clamp-1">
                    {product.title}
                  </h3>
                  <p className="text-gray-600 text-[10px] mb-2 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-green-600">{product.price}</span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddToCart(product, 1);
                      }}
                      className="px-2 py-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-md hover:shadow-md transition-all flex items-center gap-1 text-[10px]"
                    >
                      <ShoppingCart className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Products Section
function ProductsSection({ onProductClick, onAddToCart }: { 
  onProductClick: (id: number) => void;
  onAddToCart: (product: Product, quantity: number) => void;
}) {
  const categories = ['Todos', 'Proteínas', 'Vitaminas', 'Omega-3', 'Pre-Workout', 'Colágeno'];

  return (
    <section className="py-12 bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8 pt-4"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 rounded-full mb-4 text-sm">
            <span>Nuestros productos</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            <span className="block">Productos</span>
            <span className="block bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Premium</span>
          </h1>
          <p className="text-base text-gray-600 max-w-2xl mx-auto">
            Descubre nuestra amplia gama de suplementos y productos premium diseñados para potenciar tu bienestar
          </p>
        </motion.div>

        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm">
            <Filter className="w-3.5 h-3.5" />
            <span>Filtrar</span>
          </button>
          {categories.map((category) => (
            <button
              key={category}
              className={`px-3 py-1.5 rounded-lg transition-all text-sm ${
                category === 'Todos'
                  ? 'bg-green-500 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {products.map((product, index) => (
            <ModernProductCard
              key={product.id}
              image={product.image}
              title={product.title}
              description={product.description}
              price={product.price}
              rating={product.rating}
              badge={product.badge}
              delay={index * 0.1}
              onClick={() => onProductClick(product.id)}
              onAddToCart={() => onAddToCart(product, 1)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// Product Detail Component
function ProductDetail({ product, onBack, onAddToCart, onAddProductToCart }: { 
  product: Product; 
  onBack: () => void;
  onAddToCart: (quantity: number) => void;
  onAddProductToCart?: (product: Product, quantity: number) => void;
}) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'nutrition' | 'reviews'>('description');
  const images = product.images || [product.image];
  const relatedProducts = products.filter(p => p.id !== product.id && p.category === product.category).slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Volver a productos</span>
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          <div>
            <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100 mb-4">
              <ImageWithFallback
                src={images[selectedImage]}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            </div>
            {images.length > 1 && (
              <div className="flex gap-4">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 ${
                      selectedImage === idx ? 'border-green-600' : 'border-gray-200'
                    }`}
                  >
                    <ImageWithFallback src={img} alt={`${product.title} ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            {product.badge && (
              <Badge className="bg-green-500 text-white border-0 mb-4">{product.badge}</Badge>
            )}
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{product.title}</h1>
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="text-gray-700">{product.rating}</span>
              </div>
              <span className="text-gray-400">|</span>
              <span className="text-green-600 text-2xl font-bold">{product.price}</span>
            </div>
            <p className="text-gray-600 mb-8">{product.description}</p>

            <div className="flex items-center gap-4 mb-8">
              <div className="flex items-center gap-4 border border-gray-200 rounded-lg p-2">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 hover:bg-gray-100 rounded">
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="p-2 hover:bg-gray-100 rounded">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <button 
                onClick={() => onAddToCart(quantity)}
                className="flex-1 px-8 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <CartIcon className="w-5 h-5" />
                Agregar al Carrito
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Truck className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Envío Gratis</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Shield className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Garantía</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <RefreshCw className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Devolución</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-16">
          <div className="flex gap-4 border-b border-gray-200 mb-8">
            {['description', 'nutrition', 'reviews'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-6 py-3 border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-green-600 text-green-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab === 'description' ? 'Descripción' : tab === 'nutrition' ? 'Información Nutricional' : 'Reseñas'}
              </button>
            ))}
          </div>

          <div className="prose max-w-none">
            {activeTab === 'description' && (
              <div>
                <p className="text-gray-600 mb-4">{product.longDescription || product.description}</p>
                {product.benefits && (
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold mb-4">Beneficios</h3>
                    <ul className="space-y-2">
                      {product.benefits.map((benefit, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-600">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'nutrition' && product.nutritionalInfo && (
              <div>
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-4">Información Nutricional</h3>
                  <p className="text-gray-600 mb-2">Tamaño de porción: {product.nutritionalInfo.servingSize}</p>
                  <p className="text-gray-600">Porciones por envase: {product.nutritionalInfo.servingsPerContainer}</p>
                </div>
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4">Nutriente</th>
                      <th className="text-right py-3 px-4">Cantidad</th>
                      <th className="text-right py-3 px-4">Valor Diario</th>
                    </tr>
                  </thead>
                  <tbody>
                    {product.nutritionalInfo.nutrients.map((nutrient, i) => (
                      <tr key={i} className="border-b border-gray-100">
                        <td className="py-3 px-4">{nutrient.name}</td>
                        <td className="text-right py-3 px-4">{nutrient.amount}</td>
                        <td className="text-right py-3 px-4">{nutrient.dailyValue || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'reviews' && product.reviews && (
              <div className="space-y-6">
                {product.reviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-200 pb-6">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{review.author}</span>
                        {review.verified && (
                          <Badge className="bg-green-100 text-green-700 border-0">Verificado</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-600 mb-2">{review.comment}</p>
                    <span className="text-sm text-gray-400">{review.date}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-8">Productos Relacionados</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedProducts.map((p) => (
                <ModernProductCard
                  key={p.id}
                  image={p.image}
                  title={p.title}
                  description={p.description}
                  price={p.price}
                  rating={p.rating}
                  badge={p.badge}
                  onClick={() => {}}
                  onAddToCart={() => onAddProductToCart?.(p, 1)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Nutritionist Section
function NutritionistSection() {
  const benefits = [
    'Plan de alimentación adaptado a tus metas',
    'Seguimiento personalizado semana a semana',
    'Recetas y menús completos incluidos',
    'Asesoría profesional certificada'
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-green-50">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <ImageWithFallback
                src="/images/nutriologojpg.jpg"
                alt="Nutriólogo Profesional"
                className="w-full h-[500px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-green-900/40 to-transparent" />
              
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur p-6 rounded-2xl shadow-xl"
              >
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="flex items-center justify-center mb-2">
                      <Award className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="text-gray-900 mb-1">15+</div>
                    <div className="text-xs text-gray-600">Años Exp.</div>
                  </div>
                  <div>
                    <div className="flex items-center justify-center mb-2">
                      <Users className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="text-gray-900 mb-1">5000+</div>
                    <div className="text-xs text-gray-600">Clientes</div>
                  </div>
                  <div>
                    <div className="flex items-center justify-center mb-2">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="text-gray-900 mb-1">98%</div>
                    <div className="text-xs text-gray-600">Éxito</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full mb-6">
              <span>Consultoría Profesional</span>
            </div>

            <h2 className="text-gray-900 mb-4">Conoce a Nuestro Nutriólogo</h2>
            <p className="text-xl text-gray-600 mb-6">
              Dr. Ricardo Gómez, Especialista en Nutrición y Bienestar
            </p>

            <p className="text-gray-600 mb-8">
              Nuestro nutriólogo certificado está aquí para ayudarte a alcanzar tus metas de salud. 
              Con años de experiencia y un enfoque personalizado, creamos planes de alimentación 
              que se adaptan a tu estilo de vida y objetivos específicos.
            </p>

            <div className="space-y-4 mb-8">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-gray-700">{benefit}</span>
                </motion.div>
              ))}
            </div>

            <div className="flex flex-wrap gap-4">
              <button className="group px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span>Agendar Consulta</span>
              </button>
              <button className="px-8 py-4 bg-white text-gray-700 rounded-xl hover:shadow-lg transition-all border border-gray-200">
                Más Información
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// About Us Section
function AboutUsSection() {
  const values = [
    {
      icon: Target,
      title: 'Nuestra Misión',
      description: 'Ser la empresa líder en productos de salud y bienestar, ofreciendo soluciones innovadoras y de la más alta calidad para mejorar la vida de nuestros clientes.',
      color: 'from-green-500 to-emerald-600'
    },
    {
      icon: Heart,
      title: 'Nuestros Valores',
      description: 'Calidad, confianza y compromiso con tu salud. Trabajamos con los mejores proveedores para garantizar productos seguros y efectivos.',
      color: 'from-red-500 to-pink-600'
    },
    {
      icon: Shield,
      title: 'Calidad Garantizada',
      description: 'Todos nuestros productos están certificados y pasan rigurosos controles de calidad. Tu seguridad es nuestra prioridad número uno.',
      color: 'from-blue-500 to-cyan-600'
    },
    {
      icon: Zap,
      title: 'Innovación Constante',
      description: 'Nos mantenemos a la vanguardia investigando y desarrollando los mejores suplementos con tecnología de última generación.',
      color: 'from-yellow-500 to-orange-600'
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full mb-4">
            <span>Conócenos</span>
          </div>
          <h2 className="text-gray-900 mb-4">Sobre Nosotros</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Comprometidos con tu bienestar desde hace más de 10 años
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((value, index) => {
            const Icon = value.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-all"
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${value.color} rounded-xl flex items-center justify-center mb-4`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-gray-900 mb-2">{value.title}</h3>
                <p className="text-gray-600 text-sm">{value.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// Consultas Section (simplified)
function ConsultasSection({ selectedType, setSelectedType, selectedDay, setSelectedDay, selectedTime, setSelectedTime }: any) {
  const consultationTypes = [
    {
      id: 'online',
      icon: Video,
      title: 'Consulta Online',
      description: 'Consulta virtual desde la comodidad de tu hogar',
      duration: '45 min',
      price: '$599',
      features: ['Videollamada en HD', 'Plan nutricional personalizado', 'Material educativo digital', 'Seguimiento por WhatsApp']
    },
    {
      id: 'presencial',
      icon: MapPin,
      title: 'Consulta Presencial',
      description: 'Atención personalizada en nuestro consultorio',
      duration: '60 min',
      price: '$799',
      features: ['Análisis de composición corporal', 'Plan nutricional personalizado', 'Recetario personalizado', 'Seguimiento continuo'],
      badge: 'Recomendado'
    },
    {
      id: 'seguimiento',
      icon: Users,
      title: 'Seguimiento',
      description: 'Consulta de seguimiento para revisar tu progreso',
      duration: '30 min',
      price: '$399',
      features: ['Revisión de avances', 'Ajuste del plan nutricional', 'Resolución de dudas', 'Motivación y apoyo']
    }
  ];

  const availableSlots = [
    { day: 'Lunes', slots: ['09:00', '11:00', '14:00', '16:00'] },
    { day: 'Martes', slots: ['10:00', '12:00', '15:00', '17:00'] },
    { day: 'Miércoles', slots: ['09:00', '11:00', '14:00', '16:00'] },
    { day: 'Jueves', slots: ['10:00', '12:00', '15:00', '17:00'] },
    { day: 'Viernes', slots: ['09:00', '11:00', '14:00'] }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="relative py-20 bg-gradient-to-br from-green-500 via-emerald-600 to-teal-700 overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-white max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur rounded-full mb-6">
              <Calendar className="w-4 h-4" />
              <span>Agenda tu consulta</span>
            </div>
            <h1 className="text-white mb-6">Consultas Nutricionales Profesionales</h1>
            <p className="text-white/90 text-xl mb-8">
              Recibe asesoría personalizada de nutriólogos certificados para alcanzar tus objetivos de salud
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-gray-900 mb-4">Elige el Tipo de Consulta que Prefieras</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {consultationTypes.map((type, index) => {
              const Icon = type.icon;
              return (
                <motion.div
                  key={type.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative bg-white rounded-2xl p-8 border-2 transition-all cursor-pointer ${
                    selectedType === type.id
                      ? 'border-green-500 shadow-xl scale-105'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-lg'
                  }`}
                  onClick={() => setSelectedType(type.id)}
                >
                  {type.badge && (
                    <Badge className="absolute top-4 right-4 bg-green-500 text-white border-0">
                      {type.badge}
                    </Badge>
                  )}

                  <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="w-7 h-7 text-green-600" />
                  </div>

                  <h3 className="text-gray-900 mb-2">{type.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{type.description}</p>

                  <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">{type.duration}</span>
                    </div>
                    <div className="text-green-600">{type.price}</div>
                  </div>

                  <ul className="space-y-3">
                    {type.features.map((feature: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    className={`w-full mt-6 px-6 py-3 rounded-xl transition-all ${
                      selectedType === type.id
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedType(type.id);
                      const message = `Hola, me interesa agendar una ${type.title}. ¿Me podrían dar más información?`;
                      window.open(`https://wa.me/527443508109?text=${encodeURIComponent(message)}`, '_blank');
                    }}
                  >
                    Seleccionar
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {selectedType && (
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h2 className="text-gray-900 mb-8 text-center">Agenda tu Cita</h2>

                <div className="mb-8">
                  <h3 className="text-gray-900 mb-4">Selecciona el día</h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot.day}
                        onClick={() => {
                          setSelectedDay(slot.day);
                          setSelectedTime(null);
                        }}
                        className={`px-4 py-3 rounded-xl transition-all ${
                          selectedDay === slot.day
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {slot.day}
                      </button>
                    ))}
                  </div>
                </div>

                {selectedDay && (
                  <div className="mb-8">
                    <h3 className="text-gray-900 mb-4">Selecciona la hora</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {availableSlots
                        .find((s: any) => s.day === selectedDay)
                        ?.slots.map((time: string) => (
                          <button
                            key={time}
                            onClick={() => setSelectedTime(time)}
                            className={`px-4 py-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
                              selectedTime === time
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            <Clock className="w-4 h-4" />
                            {time}
                          </button>
                        ))}
                    </div>
                  </div>
                )}

                {selectedTime && (
                  <div className="space-y-4">
                    <h3 className="text-gray-900 mb-4">Tus datos</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Nombre completo"
                        className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 transition-colors"
                      />
                      <input
                        type="email"
                        placeholder="Correo electrónico"
                        className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 transition-colors"
                      />
                      <input
                        type="tel"
                        placeholder="Teléfono"
                        className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 transition-colors"
                      />
                      <input
                        type="number"
                        placeholder="Edad"
                        className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 transition-colors"
                      />
                    </div>
                    <textarea
                      placeholder="Cuéntanos sobre tus objetivos de salud..."
                      rows={4}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 transition-colors"
                    />

                    <button className="w-full px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:shadow-xl hover:scale-105 transition-all">
                      Confirmar Cita
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

// Sobre Nosotros Section (simplified)
function SobreNosotrosSection() {
  return (
    <div className="min-h-screen bg-gray-50">
      <section className="relative py-20 bg-gradient-to-br from-green-500 via-emerald-600 to-teal-700 overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-white max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur rounded-full mb-6">
              <Heart className="w-4 h-4" />
              <span>Nuestra Historia</span>
            </div>
            <h1 className="text-white mb-6">Comprometidos con tu Salud</h1>
            <p className="text-white/90 text-xl">
              Innovando cada día y ayudando a personas como tú a alcanzar sus objetivos de salud y bienestar
            </p>
          </motion.div>
        </div>
      </section>

      <AboutUsSection />
      <NutritionistSection />
    </div>
  );
}

// Plan Personalizado Section (simplified)
function PlanPersonalizadoSection() {
  return (
    <div className="min-h-screen bg-gray-50">
      <section className="relative py-20 bg-gradient-to-br from-green-500 via-emerald-600 to-teal-700 overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-white max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur rounded-full mb-6">
              <Target className="w-4 h-4" />
              <span>Tu plan a medida</span>
            </div>
            <h1 className="text-white mb-6">Plan Nutricional Personalizado</h1>
            <p className="text-white/90 text-xl mb-8">
              Transforma tu salud con un plan diseñado específicamente para ti, tus objetivos y tu estilo de vida
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-gray-900 mb-4">Elige el Plan Ideal para Ti</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Diferentes opciones para ajustarse a tus necesidades y presupuesto
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {[
              {
                id: 'basico',
                name: 'Plan Básico',
                duration: '1 mes',
                price: '$1,499',
                originalPrice: '$1,999',
                features: [
                  'Evaluación inicial completa',
                  'Plan nutricional personalizado',
                  'Recetario con 30 recetas',
                  '2 consultas de seguimiento',
                  'Soporte por WhatsApp',
                  'Material educativo digital'
                ]
              },
              {
                id: 'premium',
                name: 'Plan Premium',
                duration: '3 meses',
                price: '$3,999',
                originalPrice: '$5,997',
                discount: '33% OFF',
                badge: 'Más Popular',
                features: [
                  'Todo lo del Plan Básico',
                  'Rutina de ejercicio personalizada',
                  '6 consultas de seguimiento',
                  'Análisis de composición corporal',
                  'Plan de suplementación',
                  'Grupo privado de apoyo',
                  'Acceso a webinars exclusivos'
                ]
              },
              {
                id: 'elite',
                name: 'Plan Elite',
                duration: '6 meses',
                price: '$6,999',
                originalPrice: '$11,994',
                discount: '42% OFF',
                badge: 'Mejor Valor',
                features: [
                  'Todo lo del Plan Premium',
                  '12 consultas de seguimiento',
                  'Coach personal dedicado',
                  'Análisis mensual de progreso',
                  'Plan de comidas semanal',
                  'Sesiones de coaching mental',
                  'Garantía de resultados',
                  'Acceso de por vida a recursos'
                ]
              }
            ].map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`relative bg-white rounded-2xl p-8 border-2 transition-all ${
                  plan.badge
                    ? 'border-green-500 shadow-2xl scale-105'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-lg'
                }`}
              >
                {plan.badge && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-white border-0">
                    {plan.badge}
                  </Badge>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-gray-900 mb-2">{plan.name}</h3>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="text-gray-400 line-through">{plan.originalPrice}</span>
                    {plan.discount && (
                      <Badge className="bg-red-100 text-red-700 border-0">
                        {plan.discount}
                      </Badge>
                    )}
                  </div>
                  <div className="text-green-600 mb-1 text-2xl font-bold">{plan.price}</div>
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span>{plan.duration}</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  className={`w-full px-6 py-4 rounded-xl transition-all ${
                    plan.badge
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-xl hover:scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Comenzar Ahora
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

// Cart Sidebar Component
function CartSidebar({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  total
}: {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (productId: number, quantity: number) => void;
  onRemoveItem: (productId: number) => void;
  onCheckout: () => void;
  total: number;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Carrito de Compras</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <CartIcon className="w-16 h-16 text-gray-300 mb-4" />
                  <p className="text-gray-500 text-lg mb-2">Tu carrito está vacío</p>
                  <p className="text-gray-400 text-sm">Agrega productos para comenzar</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => {
                    const price = parseFloat(item.product.price.replace('$', ''));
                    return (
                      <div
                        key={item.product.id}
                        className="flex gap-4 p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0 flex items-center justify-center">
                          <ImageWithFallback
                            src={item.product.image}
                            alt={item.product.title}
                            className="w-full h-full object-cover object-center"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
                            {item.product.title}
                          </h3>
                          <p className="text-green-600 font-bold mb-2">
                            ${(price * item.quantity).toFixed(2)}
                          </p>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-2 border border-gray-300 rounded-lg">
                              <button
                                onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                                className="p-1 hover:bg-gray-200 rounded transition-colors"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="w-8 text-center text-sm">{item.quantity}</span>
                              <button
                                onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                                className="p-1 hover:bg-gray-200 rounded transition-colors"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                            <button
                              onClick={() => onRemoveItem(item.product.id)}
                              className="p-1.5 hover:bg-red-100 text-red-600 rounded transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="border-t border-gray-200 p-6 space-y-4">
                <div className="flex items-center justify-between text-lg">
                  <span className="font-semibold text-gray-900">Total:</span>
                  <span className="font-bold text-green-600 text-xl">
                    ${total.toFixed(2)}
                  </span>
                </div>
                <button
                  onClick={onCheckout}
                  className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold"
                >
                  Proceder al Pago
                </button>
                <button
                  onClick={onClose}
                  className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Seguir Comprando
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Checkout Page Component
function CheckoutPage({
  cart,
  onBack,
  onUpdateQuantity,
  onRemoveItem,
  total
}: {
  cart: CartItem[];
  onBack: () => void;
  onUpdateQuantity: (productId: number, quantity: number) => void;
  onRemoveItem: (productId: number) => void;
  total: number;
}) {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal' | 'transfer'>('card');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('¡Gracias por tu compra! Tu pedido ha sido procesado.');
    onBack();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Volver</span>
        </button>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Información de Envío</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Correo Electrónico *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dirección *
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                    required
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ciudad *
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Código Postal *
                    </label>
                    <input
                      type="text"
                      value={formData.postalCode}
                      onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                      required
                    />
                  </div>
                </div>

                <div className="mt-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Método de Pago</h3>
                  <div className="space-y-3 mb-6">
                    <label className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                      <input
                        type="radio"
                        name="payment"
                        value="card"
                        checked={paymentMethod === 'card'}
                        onChange={(e) => setPaymentMethod(e.target.value as any)}
                        className="w-4 h-4 text-green-600"
                      />
                      <CreditCard className="w-5 h-5 text-gray-600" />
                      <span className="font-medium">Tarjeta de Crédito/Débito</span>
                    </label>
                    <label className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                      <input
                        type="radio"
                        name="payment"
                        value="paypal"
                        checked={paymentMethod === 'paypal'}
                        onChange={(e) => setPaymentMethod(e.target.value as any)}
                        className="w-4 h-4 text-green-600"
                      />
                      <CreditCard className="w-5 h-5 text-gray-600" />
                      <span className="font-medium">PayPal</span>
                    </label>
                    <label className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                      <input
                        type="radio"
                        name="payment"
                        value="transfer"
                        checked={paymentMethod === 'transfer'}
                        onChange={(e) => setPaymentMethod(e.target.value as any)}
                        className="w-4 h-4 text-green-600"
                      />
                      <CreditCard className="w-5 h-5 text-gray-600" />
                      <span className="font-medium">Transferencia Bancaria</span>
                    </label>
                  </div>

                  {paymentMethod === 'card' && (
                    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Número de Tarjeta *
                        </label>
                        <input
                          type="text"
                          value={formData.cardNumber}
                          onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                          placeholder="1234 5678 9012 3456"
                          maxLength={19}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                          required={paymentMethod === 'card'}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nombre en la Tarjeta *
                        </label>
                        <input
                          type="text"
                          value={formData.cardName}
                          onChange={(e) => setFormData({ ...formData, cardName: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                          required={paymentMethod === 'card'}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Fecha de Vencimiento *
                          </label>
                          <input
                            type="text"
                            value={formData.expiryDate}
                            onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                            placeholder="MM/AA"
                            maxLength={5}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                            required={paymentMethod === 'card'}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            CVV *
                          </label>
                          <input
                            type="text"
                            value={formData.cvv}
                            onChange={(e) => setFormData({ ...formData, cvv: e.target.value })}
                            placeholder="123"
                            maxLength={4}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                            required={paymentMethod === 'card'}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'paypal' && (
                    <div className="p-4 bg-blue-50 rounded-lg text-center">
                      <p className="text-gray-700 mb-4">Serás redirigido a PayPal para completar el pago</p>
                      <button
                        type="button"
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Continuar con PayPal
                      </button>
                    </div>
                  )}

                  {paymentMethod === 'transfer' && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-gray-700 mb-2 font-semibold">Datos para Transferencia:</p>
                      <p className="text-gray-600 text-sm mb-1">Banco: Health Market Bank</p>
                      <p className="text-gray-600 text-sm mb-1">CLABE: 012345678901234567</p>
                      <p className="text-gray-600 text-sm">Cuenta: 1234567890</p>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full mt-6 px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold text-lg"
                >
                  Confirmar Pedido
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Resumen del Pedido</h3>
              <div className="space-y-3 mb-4">
                {cart.map((item) => {
                  const price = parseFloat(item.product.price.replace('$', ''));
                  return (
                    <div key={item.product.id} className="flex gap-3">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                        <ImageWithFallback
                          src={item.product.image}
                          alt={item.product.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm line-clamp-1">
                          {item.product.title}
                        </p>
                        <p className="text-gray-500 text-xs">Cantidad: {item.quantity}</p>
                        <p className="text-green-600 font-semibold text-sm">
                          ${(price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex items-center justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-gray-600">
                  <span>Envío</span>
                  <span className="text-green-600">Gratis</span>
                </div>
                <div className="flex items-center justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span className="text-green-600">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

