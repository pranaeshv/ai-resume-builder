import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Builder from './pages/Builder'
import ProtectedRoute from './components/ProtectedRoute'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
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
      </Routes>
    </BrowserRouter>
  )
}