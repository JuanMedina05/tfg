import { Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import Catalog from './pages/Catalog'
import About from './pages/About'
import Login from './pages/Login'
import Cart from './pages/Cart'
import Profile from './pages/Profile'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/sobre-nosotros" element={<About />} />
          
          {/* Rutas Privadas */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Catalog />
              </ProtectedRoute>
            } 
          />
          
          {/* Rutas Privadas */}
          <Route 
            path="/mi-perfil" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/carrito" 
            element={
              <ProtectedRoute>
                <Cart />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
