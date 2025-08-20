"use client"

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { userService, CreateUserRequest, UpdateUserRequest } from '@/lib/api/services/user'
import { roleService } from '@/lib/api/services/role'
import { User, Role } from '@/lib/api/types/auth'
import { PaginationResponse } from '@/lib/api/types/common'
import { Button } from '@/components/ui/button'
import { AnimatedInput } from '@/components/ui/animated-input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Edit2, Search, UserPlus, UserCheck, UserX, Mail, Shield, Users, Filter } from 'lucide-react'
import { toast } from 'sonner'

export default function UsersPage() {
  const { hasRole } = useAuth()
  const [users, setUsers] = useState<PaginationResponse<User> | null>(null)
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  
  // Search and pagination
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [filterRole, setFilterRole] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  
  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  
  // Form states
  const [createForm, setCreateForm] = useState<CreateUserRequest>({
    username: '',
    email: '',
    password: '',
    fullName: '',
    roleId: ''
  })
  const [updateForm, setUpdateForm] = useState<UpdateUserRequest>({})
  
  // Validation states
  const [createFormErrors, setCreateFormErrors] = useState<Record<string, string>>({})
  const [updateFormErrors, setUpdateFormErrors] = useState<Record<string, string>>({})

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true)
      const response = await userService.getUsers(currentPage, pageSize)
      setUsers(response)
    } catch (err) {
      toast.error('Failed to load users')
      console.error('Error loading users:', err)
    } finally {
      setLoading(false)
    }
  }, [currentPage, pageSize])

  const loadRoles = useCallback(async () => {
    try {
      const rolesData = await roleService.getRoles()
      setRoles(rolesData)
    } catch (err) {
      console.error('Error loading roles:', err)
    }
  }, [])

  useEffect(() => {
    if (!hasRole('admin')) {
      toast.error('Access denied. Admin role required.')
      setLoading(false)
      return
    }
    loadUsers()
    loadRoles()
  }, [currentPage, hasRole, loadUsers, loadRoles])

  const validateCreateForm = (): boolean => {
    const errors: Record<string, string> = {}
    
    if (!createForm.username.trim()) {
      errors.username = 'Username is required'
    } else if (createForm.username.length < 3) {
      errors.username = 'Username must be at least 3 characters'
    }
    
    if (!createForm.fullName.trim()) {
      errors.fullName = 'Full name is required'
    }
    
    if (!createForm.password.trim()) {
      errors.password = 'Password is required'
    } else if (createForm.password.length < 6) {
      errors.password = 'Password must be at least 6 characters'
    }
    
    if (createForm.email && !/\S+@\S+\.\S+/.test(createForm.email)) {
      errors.email = 'Email format is invalid'
    }
    
    if (!createForm.roleId) {
      errors.roleId = 'Role selection is required'
    }
    
    setCreateFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const validateUpdateForm = (): boolean => {
    const errors: Record<string, string> = {}
    
    if (updateForm.username && updateForm.username.length < 3) {
      errors.username = 'Username must be at least 3 characters'
    }
    
    if (updateForm.password && updateForm.password.length < 6) {
      errors.password = 'Password must be at least 6 characters'
    }
    
    if (updateForm.email && updateForm.email.length > 0 && !/\S+@\S+\.\S+/.test(updateForm.email)) {
      errors.email = 'Email format is invalid'
    }
    
    setUpdateFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleCreateUser = async () => {
    if (!validateCreateForm()) return
    
    try {
      await userService.createUser(createForm)
      toast.success('User created successfully! 🎉')
      setIsCreateDialogOpen(false)
      setCreateForm({ username: '', email: '', password: '', fullName: '', roleId: '' })
      setCreateFormErrors({})
      loadUsers()
    } catch (err) {
      toast.error('Failed to create user')
      console.error('Error creating user:', err)
    }
  }

  const handleUpdateUser = async () => {
    if (!selectedUser || !validateUpdateForm()) return
    
    try {
      await userService.updateUser(selectedUser.id, updateForm)
      toast.success('User updated successfully! ✨')
      setIsEditDialogOpen(false)
      setUpdateForm({})
      setUpdateFormErrors({})
      setSelectedUser(null)
      loadUsers()
    } catch (err) {
      toast.error('Failed to update user')
      console.error('Error updating user:', err)
    }
  }

  const handleToggleUserStatus = async (userId: string, isActive: boolean) => {
    const action = isActive ? 'deactivate' : 'activate'
    const actionLabel = isActive ? 'Deactivate' : 'Activate'
    
    toast(`Are you sure you want to ${action} this user?`, {
      action: {
        label: actionLabel,
        onClick: async () => {
          try {
            if (isActive) {
              await userService.deactivateUser(userId)
              toast.success('User deactivated successfully')
            } else {
              await userService.activateUser(userId)
              toast.success('User activated successfully')
            }
            loadUsers()
          } catch (err) {
            toast.error(`Failed to ${action} user`)
            console.error(`Error ${action}ing user:`, err)
          }
        }
      },
      cancel: {
        label: 'Cancel',
        onClick: () => {}
      }
    })
  }

  const handleAssignRole = async (userId: string, roleId: string) => {
    try {
      await userService.assignRole(userId, roleId)
      toast.success('Role assigned successfully! 👑')
      loadUsers()
    } catch (err) {
      toast.error('Failed to assign role')
      console.error('Error assigning role:', err)
    }
  }

  const openEditDialog = (user: User) => {
    setSelectedUser(user)
    setUpdateForm({
      username: user.username,
      email: user.email || '',
      fullName: user.fullName
    })
    setUpdateFormErrors({})
    setIsEditDialogOpen(true)
  }

  const filteredUsers = users?.data?.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesRole = filterRole === 'all' || user.role?.id === filterRole || user.userRole?.role?.id === filterRole
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && user.isActive) ||
      (filterStatus === 'inactive' && !user.isActive)
    
    return matchesSearch && matchesRole && matchesStatus
  }) || []

  if (!hasRole('admin')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <Card className="w-full max-w-md border-red-200 dark:border-red-800">
          <CardContent className="p-8 text-center">
            <Shield className="w-16 h-16 mx-auto mb-4 text-red-500" />
            <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">Access Denied</h2>
            <p className="text-gray-600 dark:text-gray-400">Admin role required to access this page</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg">
                <Users className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                  User Management
                </h1>
                <p className="text-lg text-slate-600 dark:text-slate-400">Manage users and their roles with ease</p>
              </div>
            </div>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 border-0"
              >
                <UserPlus className="w-5 h-5 mr-2" />
                Add New User
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg border-0 shadow-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl">
              <DialogHeader className="space-y-3">
                <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-blue-600 text-white">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  Create New User
                </DialogTitle>
                <DialogDescription className="text-base text-slate-600 dark:text-slate-400">
                  Add a new user to the system with their basic information
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <AnimatedInput
                    label="Username"
                    value={createForm.username}
                    onChange={(e) => {
                      setCreateForm({ ...createForm, username: e.target.value })
                      if (createFormErrors.username) {
                        setCreateFormErrors({ ...createFormErrors, username: '' })
                      }
                    }}
                    error={createFormErrors.username}
                    className="col-span-1"
                  />
                  <AnimatedInput
                    label="Full Name"
                    value={createForm.fullName}
                    onChange={(e) => {
                      setCreateForm({ ...createForm, fullName: e.target.value })
                      if (createFormErrors.fullName) {
                        setCreateFormErrors({ ...createFormErrors, fullName: '' })
                      }
                    }}
                    error={createFormErrors.fullName}
                    className="col-span-1"
                  />
                </div>
                
                <AnimatedInput
                  label="Email (Optional)"
                  type="email"
                  value={createForm.email}
                  onChange={(e) => {
                    setCreateForm({ ...createForm, email: e.target.value })
                    if (createFormErrors.email) {
                      setCreateFormErrors({ ...createFormErrors, email: '' })
                    }
                  }}
                  error={createFormErrors.email}
                />
                
                <AnimatedInput
                  label="Password"
                  type="password"
                  value={createForm.password}
                  onChange={(e) => {
                    setCreateForm({ ...createForm, password: e.target.value })
                    if (createFormErrors.password) {
                      setCreateFormErrors({ ...createFormErrors, password: '' })
                    }
                  }}
                  error={createFormErrors.password}
                />
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Role <span className="text-red-500">*</span>
                  </label>
                  <Select 
                    value={createForm.roleId} 
                    onValueChange={(roleId) => {
                      setCreateForm({ ...createForm, roleId })
                      if (createFormErrors.roleId) {
                        setCreateFormErrors({ ...createFormErrors, roleId: '' })
                      }
                    }}
                  >
                    <SelectTrigger className="w-full h-12 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-slate-200 dark:border-slate-700">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{role.name}</span>
                            <span className="text-xs text-slate-500">{role.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {createFormErrors.roleId && (
                    <p className="text-sm text-red-500">{createFormErrors.roleId}</p>
                  )}
                </div>
                
                <div className="flex gap-3 pt-4">
                  <Button 
                    onClick={handleCreateUser} 
                    className="flex-1 bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white border-0 h-12"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Create User
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsCreateDialogOpen(false)
                      setCreateFormErrors({})
                    }}
                    className="px-8 h-12"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Main Content */}
        <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl">
          <CardHeader className="space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">
                  Users Directory
                </CardTitle>
                <CardDescription className="text-base text-slate-600 dark:text-slate-400">
                  Manage system users and their roles
                </CardDescription>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <AnimatedInput
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full sm:w-80 h-11"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Select value={filterRole} onValueChange={setFilterRole}>
                    <SelectTrigger className="w-32 h-11 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-slate-200 dark:border-slate-700">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-32 h-11 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-slate-200 dark:border-slate-700">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            {loading ? (
              <div className="flex justify-center p-12">
                <div className="flex flex-col items-center gap-4">
                  <LoadingSpinner />
                  <p className="text-slate-600 dark:text-slate-400">Loading users...</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-200 dark:border-slate-700">
                        <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">User</TableHead>
                        <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">Contact</TableHead>
                        <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">Role</TableHead>
                        <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">Status</TableHead>
                        <TableHead className="text-slate-700 dark:text-slate-300 font-semibold text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => {
                        const currentRole = user.role || user.userRole?.role
                        return (
                          <TableRow 
                            key={user.id}
                            className="border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
                          >
                            <TableCell className="py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
                                  {user.fullName.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div className="font-semibold text-slate-900 dark:text-white">{user.username}</div>
                                  <div className="text-sm text-slate-600 dark:text-slate-400">{user.fullName}</div>
                                </div>
                              </div>
                            </TableCell>
                            
                            <TableCell className="py-4">
                              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                <Mail className="w-4 h-4" />
                                <span>{user.email || 'No email'}</span>
                              </div>
                            </TableCell>
                            
                            <TableCell className="py-4">
                              <div className="flex items-center gap-3">
                                {currentRole ? (
                                  <Badge 
                                    variant="secondary" 
                                    className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 text-purple-800 dark:text-purple-200 border-0"
                                  >
                                    <Shield className="w-3 h-3 mr-1" />
                                    {currentRole.name}
                                  </Badge>
                                ) : (
                                  <span className="text-slate-500 text-sm">No role assigned</span>
                                )}
                                <Select onValueChange={(roleId) => handleAssignRole(user.id, roleId)}>
                                  <SelectTrigger className="w-8 h-8 p-0 border-dashed border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800">
                                    <Edit2 className="w-4 h-4" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {roles.map((role) => (
                                      <SelectItem key={role.id} value={role.id}>
                                        {role.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </TableCell>
                            
                            <TableCell className="py-4">
                              <Badge 
                                variant={user.isActive ? "default" : "secondary"}
                                className={user.isActive 
                                  ? "bg-gradient-to-r from-emerald-100 to-green-100 dark:from-emerald-900 dark:to-green-900 text-emerald-800 dark:text-emerald-200 border-0" 
                                  : "bg-gradient-to-r from-red-100 to-orange-100 dark:from-red-900 dark:to-orange-900 text-red-800 dark:text-red-200 border-0"
                                }
                              >
                                {user.isActive ? (
                                  <>
                                    <UserCheck className="w-3 h-3 mr-1" />
                                    Active
                                  </>
                                ) : (
                                  <>
                                    <UserX className="w-3 h-3 mr-1" />
                                    Inactive
                                  </>
                                )}
                              </Badge>
                            </TableCell>
                            
                            <TableCell className="py-4 text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openEditDialog(user)}
                                  className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-colors"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleToggleUserStatus(user.id, user.isActive)}
                                  className={user.isActive 
                                    ? "hover:bg-red-50 hover:text-red-600 hover:border-red-300" 
                                    : "hover:bg-green-50 hover:text-green-600 hover:border-green-300"
                                  }
                                  title={user.isActive ? "Deactivate user" : "Activate user"}
                                >
                                  {user.isActive ? (
                                    <UserX className="w-4 h-4" />
                                  ) : (
                                    <UserCheck className="w-4 h-4" />
                                  )}
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>

                {users && users.total && (
                  <div className="flex flex-col sm:flex-row justify-between items-center pt-6 px-6 pb-6 gap-4">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Showing <span className="font-semibold">{(currentPage - 1) * pageSize + 1}</span> to{' '}
                      <span className="font-semibold">{Math.min(currentPage * pageSize, users.total)}</span> of{' '}
                      <span className="font-semibold">{users.total}</span> users
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-6"
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setCurrentPage(prev => prev + 1)}
                        disabled={currentPage >= Math.ceil(users.total / pageSize)}
                        className="px-6"
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-lg border-0 shadow-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl">
            <DialogHeader className="space-y-3">
              <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                  <Edit2 className="w-5 h-5" />
                </div>
                Edit User
              </DialogTitle>
              <DialogDescription className="text-base text-slate-600 dark:text-slate-400">
                Update user information and settings
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AnimatedInput
                  label="Username"
                  value={updateForm.username || ''}
                  onChange={(e) => {
                    setUpdateForm({ ...updateForm, username: e.target.value })
                    if (updateFormErrors.username) {
                      setUpdateFormErrors({ ...updateFormErrors, username: '' })
                    }
                  }}
                  error={updateFormErrors.username}
                />
                <AnimatedInput
                  label="Full Name"
                  value={updateForm.fullName || ''}
                  onChange={(e) => {
                    setUpdateForm({ ...updateForm, fullName: e.target.value })
                    if (updateFormErrors.fullName) {
                      setUpdateFormErrors({ ...updateFormErrors, fullName: '' })
                    }
                  }}
                  error={updateFormErrors.fullName}
                />
              </div>
              
              <AnimatedInput
                label="Email"
                type="email"
                value={updateForm.email || ''}
                onChange={(e) => {
                  setUpdateForm({ ...updateForm, email: e.target.value })
                  if (updateFormErrors.email) {
                    setUpdateFormErrors({ ...updateFormErrors, email: '' })
                  }
                }}
                error={updateFormErrors.email}
              />
              
              <AnimatedInput
                label="New Password (Optional)"
                type="password"
                value={updateForm.password || ''}
                onChange={(e) => {
                  setUpdateForm({ ...updateForm, password: e.target.value })
                  if (updateFormErrors.password) {
                    setUpdateFormErrors({ ...updateFormErrors, password: '' })
                  }
                }}
                error={updateFormErrors.password}
              />
              
              <div className="flex gap-3 pt-4">
                <Button 
                  onClick={handleUpdateUser} 
                  className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white border-0 h-12"
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Update User
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsEditDialogOpen(false)
                    setUpdateFormErrors({})
                  }}
                  className="px-8 h-12"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}