"use client"

import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRoles?: string[]
  requiredPermissions?: string[]
}

export function ProtectedRoute({ 
  children, 
  requiredRoles = [], 
  requiredPermissions = [] 
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user, hasRole, hasPermission } = useAuth()
  const router = useRouter()

  useEffect(() => {
    console.log('ProtectedRoute Debug:', {
      isLoading,
      isAuthenticated,
      user: user ? {
        id: user.id,
        username: user.username,
        roles: user.userRoles?.map(ur => ur.role.name)
      } : null,
      requiredRoles,
    })

    if (!isLoading && !isAuthenticated) {
      console.log('User not authenticated, redirecting to login')
      router.push('/login')
      return
    }

    if (!isLoading && isAuthenticated && user) {
      // Check role-based access
      if (requiredRoles.length > 0) {
        const hasRequiredRole = requiredRoles.some(role => hasRole(role))
        console.log('Role check:', {
          requiredRoles,
          userRoles: user.userRoles?.map(ur => ur.role.name),
          hasRequiredRole,
          hasRoleFunction: hasRole
        })
        if (!hasRequiredRole) {
          console.log('User does not have required role, redirecting to unauthorized')
          router.push('/unauthorized')
          return
        }
      }

      // Check permission-based access
      if (requiredPermissions.length > 0) {
        const hasRequiredPermission = requiredPermissions.some(permission => hasPermission(permission))
        if (!hasRequiredPermission) {
          router.push('/unauthorized')
          return
        }
      }
    }
  }, [isAuthenticated, isLoading, user, requiredRoles, requiredPermissions, router, hasRole, hasPermission])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}