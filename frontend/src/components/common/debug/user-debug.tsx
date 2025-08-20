"use client"

import { useAuth } from '@/contexts/auth-context'

export function UserDebug() {
  const { user, isAuthenticated, isLoading, hasRole } = useAuth()

  if (isLoading) return <div>Loading...</div>

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded text-xs max-w-sm">
      <h3 className="font-bold mb-2">Debug User Info</h3>
      <div>
        <strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}
      </div>
      {user && (
        <>
          <div><strong>Username:</strong> {user.username}</div>
          <div><strong>Full Name:</strong> {user.fullName}</div>
          <div><strong>Roles:</strong></div>
          <ul className="ml-4">
            {user.roles?.map(role => (
              <li key={role.id}>- {role.name}</li>
            )) || user.userRoles?.map(userRole => (
              <li key={userRole.id}>- {userRole.role.name}</li>
            )) || 'No roles'}
          </ul>
          <div className="mt-1 text-xs opacity-75">
            <strong>Role Source:</strong> {user.roles ? 'Direct roles' : user.userRoles ? 'UserRoles' : 'None'}
          </div>
          <div className="mt-2">
            <strong>Can access timbangan:</strong> {hasRole('admin') || hasRole('operator_timbangan') || hasRole('supervisor') ? 'Yes' : 'No'}
          </div>
          <div>
            <strong>Has admin role:</strong> {hasRole('admin') ? 'Yes' : 'No'}
          </div>
          <div>
            <strong>Current path:</strong> {window.location.pathname}
          </div>
        </>
      )}
    </div>
  )
}