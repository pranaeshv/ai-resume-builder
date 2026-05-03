import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Builder from './pages/Builder'
import ProtectedRoute from './components/ProtectedRoute'
import Tailor from './pages/Tailor'
import Preview from './pages/Preview'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />
        <Route path="/builder" element={
          <ProtectedRoute><Builder /></ProtectedRoute>
        } />
        <Route path="/builder/:id" element={
          <ProtectedRoute><Builder /></ProtectedRoute>
        } />
        <Route path="/tailor/:id" element={
          <ProtectedRoute><Tailor /></ProtectedRoute>
        } />
        <Route path="/preview/:id" element={
          <ProtectedRoute><Preview /></ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}