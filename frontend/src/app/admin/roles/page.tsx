"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { roleService, CreateRoleRequest, UpdateRoleRequest } from '@/lib/api/services/role'
import { Role } from '@/lib/api/types/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { StatusMessage } from '@/components/ui/status-message'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Edit2, Trash2, Shield, Search, ShieldCheck } from 'lucide-react'

const AVAILABLE_PERMISSIONS = [
  'timbangan:read',
  'timbangan:write',
  'grading:read', 
  'grading:write',
  'master:read',
  'master:write',
  'reports:read',
  'reports:write',
  'users:read',
  'users:write',
  'roles:read',
  'roles:write'
]

export default function RolesPage() {
  const { hasRole } = useAuth()
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  // Search
  const [searchTerm, setSearchTerm] = useState('')
  
  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  
  // Form states
  const [createForm, setCreateForm] = useState<CreateRoleRequest>({
    name: '',
    description: '',
    permissions: []
  })
  const [updateForm, setUpdateForm] = useState<UpdateRoleRequest>({})

  useEffect(() => {
    if (!hasRole('admin')) {
      setError('Access denied. Admin role required.')
      setLoading(false)
      return
    }
    loadRoles()
  }, [hasRole])

  const loadRoles = async () => {
    try {
      setLoading(true)
      const rolesData = await roleService.getRoles()
      setRoles(rolesData)
      setError(null)
    } catch (err) {
      setError('Failed to load roles')
      console.error('Error loading roles:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateRole = async () => {
    try {
      await roleService.createRole(createForm)
      setSuccess('Role created successfully')
      setIsCreateDialogOpen(false)
      setCreateForm({ name: '', description: '', permissions: [] })
      loadRoles()
    } catch (err) {
      setError('Failed to create role')
      console.error('Error creating role:', err)
    }
  }

  const handleUpdateRole = async () => {
    if (!selectedRole) return
    
    try {
      await roleService.updateRole(selectedRole.id, updateForm)
      setSuccess('Role updated successfully')
      setIsEditDialogOpen(false)
      setUpdateForm({})
      setSelectedRole(null)
      loadRoles()
    } catch (err) {
      setError('Failed to update role')
      console.error('Error updating role:', err)
    }
  }

  const handleDeleteRole = async (roleId: string) => {
    if (!confirm('Are you sure you want to delete this role? This action cannot be undone.')) return
    
    try {
      await roleService.deleteRole(roleId)
      setSuccess('Role deleted successfully')
      loadRoles()
    } catch (err) {
      setError('Failed to delete role')
      console.error('Error deleting role:', err)
    }
  }

  const openEditDialog = (role: Role) => {
    setSelectedRole(role)
    setUpdateForm({
      name: role.name,
      description: role.description || '',
      permissions: role.permissions || []
    })
    setIsEditDialogOpen(true)
  }

  const togglePermission = (permission: string, isCreate: boolean = false) => {
    if (isCreate) {
      const currentPermissions = createForm.permissions || []
      const newPermissions = currentPermissions.includes(permission)
        ? currentPermissions.filter(p => p !== permission)
        : [...currentPermissions, permission]
      setCreateForm({ ...createForm, permissions: newPermissions })
    } else {
      const currentPermissions = updateForm.permissions || []
      const newPermissions = currentPermissions.includes(permission)
        ? currentPermissions.filter(p => p !== permission)
        : [...currentPermissions, permission]
      setUpdateForm({ ...updateForm, permissions: newPermissions })
    }
  }

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (!hasRole('admin')) {
    return (
      <div className="container mx-auto p-6">
        <StatusMessage type="error" message="Access denied. Admin role required." />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Role Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage system roles and permissions</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <ShieldCheck className="w-4 h-4 mr-2" />
              Add Role
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Role</DialogTitle>
              <DialogDescription>
                Add a new role with specific permissions
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Role Name</Label>
                <Input
                  id="name"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  placeholder="Enter role name (e.g., operator_timbangan)"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  placeholder="Enter role description"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <div>
                <Label>Permissions</Label>
                <div className="grid grid-cols-2 gap-2 mt-2 max-h-40 overflow-y-auto">
                  {AVAILABLE_PERMISSIONS.map((permission) => (
                    <div key={permission} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`create-${permission}`}
                        checked={createForm.permissions?.includes(permission) || false}
                        onChange={() => togglePermission(permission, true)}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor={`create-${permission}`} className="text-sm">
                        {permission}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCreateRole} className="flex-1">
                  Create Role
                </Button>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {(error || success) && (
        <StatusMessage 
          type={error ? "error" : "success"} 
          message={error || success || ''} 
          onClose={() => { setError(null); setSuccess(null) }}
        />
      )}

      <Card>
        <CardHeader>
          <CardTitle>Roles</CardTitle>
          <CardDescription>Manage system roles and their permissions</CardDescription>
          <div className="flex gap-4 items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search roles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-8">
              <LoadingSpinner />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Role Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRoles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-blue-600" />
                        {role.name}
                      </div>
                    </TableCell>
                    <TableCell>{role.description || '-'}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-md">
                        {role.permissions?.map((permission) => (
                          <Badge key={permission} variant="outline" className="text-xs">
                            {permission}
                          </Badge>
                        )) || <span className="text-gray-500">No permissions</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(role)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteRole(role.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Role</DialogTitle>
            <DialogDescription>
              Update role information and permissions
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Role Name</Label>
              <Input
                id="edit-name"
                value={updateForm.name || ''}
                onChange={(e) => setUpdateForm({ ...updateForm, name: e.target.value })}
                placeholder="Enter role name"
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <textarea
                id="edit-description"
                value={updateForm.description || ''}
                onChange={(e) => setUpdateForm({ ...updateForm, description: e.target.value })}
                placeholder="Enter role description"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <div>
              <Label>Permissions</Label>
              <div className="grid grid-cols-2 gap-2 mt-2 max-h-40 overflow-y-auto">
                {AVAILABLE_PERMISSIONS.map((permission) => (
                  <div key={permission} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`edit-${permission}`}
                      checked={updateForm.permissions?.includes(permission) || false}
                      onChange={() => togglePermission(permission, false)}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor={`edit-${permission}`} className="text-sm">
                      {permission}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleUpdateRole} className="flex-1">
                Update Role
              </Button>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}