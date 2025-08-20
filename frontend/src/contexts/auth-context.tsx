"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { apiClient } from '@/lib/api/client'
import { authApi } from '@/lib/api/auth'
import { User, LoginRequest, AuthContextType } from '@/lib/api/types/auth'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const token = apiClient.getToken()
      if (token) {
        const userData = await authApi.getProfile()
        setUser(userData)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      apiClient.setToken(null)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (credentials: LoginRequest) => {
    setIsLoading(true)
    try {
      const response = await authApi.login(credentials)
      console.log('Login response from backend:', response)
      apiClient.setToken(response.access_token)
      console.log('Setting user:', response.user)
      setUser(response.user)
      return response.user // Return user data for role checking
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    console.log('Logging out user')
    // Clear all authentication data immediately
    apiClient.setToken(null)
    setUser(null)
    setIsLoading(false)
    
    // Clear any cached data
    if (typeof window !== 'undefined') {
      // Clear localStorage
      localStorage.removeItem('auth_token')
      // Clear cookies
      document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
      // Force immediate redirect to login page - no animation/transition
      window.location.replace('/login')
    }
  }

  const hasRole = (roleName: string): boolean => {
    console.log('hasRole check:', {
      roleName,
      user: user ? {
        id: user.id,
        username: user.username,
        role: user.role,
        userRole: user.userRole
      } : null,
    })
    
    if (!user) return false
    
    // Check single role (new format)
    if (user.role) {
      const hasRole = user.role.name === roleName
      console.log('Single role check result:', hasRole)
      return hasRole
    }
    
    // Check userRole format (actual backend response)
    if (user.userRole?.role) {
      const hasRole = user.userRole.role.name === roleName
      console.log('UserRole check result:', hasRole)
      return hasRole
    }
    
    // Fallback: Check legacy roles array for compatibility
    if (user.roles && user.roles.length > 0) {
      const hasDirectRole = user.roles.some(role => role.name === roleName)
      console.log('Legacy roles check result:', hasDirectRole)
      return hasDirectRole
    }
    
    console.log('No role found, returning false')
    return false
  }

  const hasPermission = (permission: string): boolean => {
    if (!user) return false
    
    // Helper function to parse permissions
    const parsePermissions = (permissions: string[] | string): string[] => {
      if (Array.isArray(permissions)) return permissions
      if (typeof permissions === 'string') {
        try {
          return JSON.parse(permissions)
        } catch {
          return []
        }
      }
      return []
    }
    
    // Check single role (new format)
    if (user.role) {
      const permissions = parsePermissions(user.role.permissions)
      return permissions.includes(permission)
    }
    
    // Check userRole format
    if (user.userRole?.role) {
      const permissions = parsePermissions(user.userRole.role.permissions)
      return permissions.includes(permission)
    }
    
    // Fallback: Check legacy roles array for compatibility
    if (user.roles && user.roles.length > 0) {
      return user.roles.some(role => {
        const permissions = parsePermissions(role.permissions)
        return permissions.includes(permission)
      })
    }
    
    return false
  }

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    hasRole,
    hasPermission
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}