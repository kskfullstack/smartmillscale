"use client"

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { companyService } from '@/lib/api/services/company'
import { Company } from '@/lib/api/types/business'
import { CreateCompanyDto, UpdateCompanyDto } from '@/lib/api/types/dto'
import { Button } from '@/components/ui/button'
import { AnimatedInput } from '@/components/ui/animated-input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Textarea } from '@/components/ui/textarea'
import { Building2, Edit2, Plus, MapPin, Phone, Mail, Globe, FileText, Calendar, Shield, CheckCircle2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

export default function CompanyPage() {
  const { hasRole } = useAuth()
  const [company, setCompany] = useState<Company | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  
  // Form states
  const [createForm, setCreateForm] = useState<CreateCompanyDto>({
    companyCode: '',
    name: '',
    businessName: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    taxId: '',
    businessLicense: '',
    industry: '',
    established: '',
    description: '',
    isActive: true
  })
  const [updateForm, setUpdateForm] = useState<UpdateCompanyDto>({})
  
  // Validation states
  const [createFormErrors, setCreateFormErrors] = useState<Record<string, string>>({})
  const [updateFormErrors, setUpdateFormErrors] = useState<Record<string, string>>({})

  const loadCompany = useCallback(async () => {
    try {
      setLoading(true)
      const response = await companyService.getCompanyProfile()
      console.log('Loaded company profile:', response)
      setCompany(response)
    } catch (err) {
      console.error('Error loading company:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!hasRole('admin')) {
      toast.error('Access denied. Admin role required.')
      setLoading(false)
      return
    }
    loadCompany()
  }, [hasRole, loadCompany])

  const validateCreateForm = (): boolean => {
    const errors: Record<string, string> = {}
    
    if (!createForm.companyCode.trim()) {
      errors.companyCode = 'Company code is required'
    }
    
    if (!createForm.name.trim()) {
      errors.name = 'Company name is required'
    }
    
    if (createForm.email && !/\S+@\S+\.\S+/.test(createForm.email)) {
      errors.email = 'Email format is invalid'
    }

    if (createForm.website && !createForm.website.match(/^https?:\/\//)) {
      errors.website = 'Website must start with http:// or https://'
    }
    
    setCreateFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const validateUpdateForm = (): boolean => {
    const errors: Record<string, string> = {}
    
    if (updateForm.companyCode && !updateForm.companyCode.trim()) {
      errors.companyCode = 'Company code cannot be empty'
    }
    
    if (updateForm.name && !updateForm.name.trim()) {
      errors.name = 'Company name cannot be empty'
    }
    
    if (updateForm.email && updateForm.email.length > 0 && !/\S+@\S+\.\S+/.test(updateForm.email)) {
      errors.email = 'Email format is invalid'
    }

    if (updateForm.website && updateForm.website.length > 0 && !updateForm.website.match(/^https?:\/\//)) {
      errors.website = 'Website must start with http:// or https://'
    }
    
    setUpdateFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleCreateCompany = async () => {
    if (!validateCreateForm()) return
    
    try {
      await companyService.createCompany(createForm)
      toast.success('Company profile created successfully! 🎉')
      setIsCreateDialogOpen(false)
      setCreateForm({
        companyCode: '',
        name: '',
        businessName: '',
        address: '',
        phone: '',
        email: '',
        website: '',
        taxId: '',
        businessLicense: '',
        industry: '',
        established: '',
        description: '',
        isActive: true
      })
      setCreateFormErrors({})
      loadCompany()
    } catch (err) {
      toast.error('Failed to create company profile')
      console.error('Error creating company:', err)
    }
  }

  const handleUpdateCompany = async () => {
    if (!company) {
      toast.error('No company profile found to update')
      return
    }
    
    if (!company.id) {
      toast.error('Company ID is missing')
      return
    }
    
    if (!validateUpdateForm()) return
    
    try {
      console.log('Updating company with ID:', company.id)
      await companyService.updateCompany(company.id, updateForm)
      toast.success('Company profile updated successfully! ✨')
      setIsEditDialogOpen(false)
      setUpdateForm({})
      setUpdateFormErrors({})
      loadCompany()
    } catch (err) {
      toast.error('Failed to update company profile')
      console.error('Error updating company:', err)
    }
  }

  const openEditDialog = () => {
    if (!company) {
      toast.error('No company profile found to edit')
      return
    }
    
    if (!company.id) {
      toast.error('Company ID is missing')
      return
    }
    
    console.log('Opening edit dialog for company:', company)
    
    setUpdateForm({
      companyCode: company.companyCode,
      name: company.name,
      businessName: company.businessName || '',
      address: company.address || '',
      phone: company.phone || '',
      email: company.email || '',
      website: company.website || '',
      taxId: company.taxId || '',
      businessLicense: company.businessLicense || '',
      industry: company.industry || '',
      established: company.established ? company.established.split('T')[0] : '',
      description: company.description || '',
      isActive: company.isActive
    })
    setUpdateFormErrors({})
    setIsEditDialogOpen(true)
  }

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
                <Building2 className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                  Company Profile
                </h1>
                <p className="text-lg text-slate-600 dark:text-slate-400">Manage your company information</p>
              </div>
            </div>
          </div>
          
          {!company && (
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 border-0"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create Company Profile
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl border-0 shadow-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="space-y-3">
                  <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-blue-600 text-white">
                      <Building2 className="w-5 h-5" />
                    </div>
                    Create Company Profile
                  </DialogTitle>
                  <DialogDescription className="text-base text-slate-600 dark:text-slate-400">
                    Add your company information and details
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-6 py-4">
                  <AnimatedInput
                    label="Company Code"
                    value={createForm.companyCode}
                    onChange={(e) => {
                      setCreateForm({ ...createForm, companyCode: e.target.value })
                      if (createFormErrors.companyCode) {
                        setCreateFormErrors({ ...createFormErrors, companyCode: '' })
                      }
                    }}
                    error={createFormErrors.companyCode}
                    placeholder="e.g., PKS001, MILL01"
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <AnimatedInput
                      label="Company Name"
                      value={createForm.name}
                      onChange={(e) => {
                        setCreateForm({ ...createForm, name: e.target.value })
                        if (createFormErrors.name) {
                          setCreateFormErrors({ ...createFormErrors, name: '' })
                        }
                      }}
                      error={createFormErrors.name}
                      className="col-span-1"
                    />
                    <AnimatedInput
                      label="Business Name (Optional)"
                      value={createForm.businessName}
                      onChange={(e) => setCreateForm({ ...createForm, businessName: e.target.value })}
                      className="col-span-1"
                    />
                  </div>
                  
                  <AnimatedInput
                    label="Address (Optional)"
                    value={createForm.address}
                    onChange={(e) => setCreateForm({ ...createForm, address: e.target.value })}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <AnimatedInput
                      label="Phone (Optional)"
                      value={createForm.phone}
                      onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                    />
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
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <AnimatedInput
                      label="Website (Optional)"
                      value={createForm.website}
                      onChange={(e) => {
                        setCreateForm({ ...createForm, website: e.target.value })
                        if (createFormErrors.website) {
                          setCreateFormErrors({ ...createFormErrors, website: '' })
                        }
                      }}
                      error={createFormErrors.website}
                      placeholder="https://example.com"
                    />
                    <AnimatedInput
                      label="Industry (Optional)"
                      value={createForm.industry}
                      onChange={(e) => setCreateForm({ ...createForm, industry: e.target.value })}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <AnimatedInput
                      label="Tax ID (Optional)"
                      value={createForm.taxId}
                      onChange={(e) => setCreateForm({ ...createForm, taxId: e.target.value })}
                    />
                    <AnimatedInput
                      label="Business License (Optional)"
                      value={createForm.businessLicense}
                      onChange={(e) => setCreateForm({ ...createForm, businessLicense: e.target.value })}
                    />
                  </div>
                  
                  <AnimatedInput
                    label="Established Date (Optional)"
                    type="date"
                    value={createForm.established}
                    onChange={(e) => setCreateForm({ ...createForm, established: e.target.value })}
                  />
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Description (Optional)
                    </label>
                    <Textarea
                      value={createForm.description}
                      onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                      placeholder="Brief description of your company..."
                      className="min-h-[100px] bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-slate-200 dark:border-slate-700"
                    />
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <Button 
                      onClick={handleCreateCompany} 
                      className="flex-1 bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white border-0 h-12"
                    >
                      <Building2 className="w-4 h-4 mr-2" />
                      Create Profile
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
          )}
        </div>

        {/* Main Content */}
        {loading ? (
          <div className="flex justify-center p-12">
            <div className="flex flex-col items-center gap-4">
              <LoadingSpinner />
              <p className="text-slate-600 dark:text-slate-400">Loading company profile...</p>
            </div>
          </div>
        ) : company ? (
          <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl">
            <CardHeader className="space-y-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white">
                    <Building2 className="w-8 h-8" />
                  </div>
                  <div>
                    <CardTitle className="text-3xl font-bold text-slate-900 dark:text-white">
                      {company.name}
                    </CardTitle>
                    <div className="text-lg font-mono text-blue-600 dark:text-blue-400">
                      Code: {company.companyCode}
                    </div>
                    {company.businessName && (
                      <CardDescription className="text-lg text-slate-600 dark:text-slate-400">
                        {company.businessName}
                      </CardDescription>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <Badge 
                        variant={company.isActive ? "default" : "secondary"}
                        className={company.isActive 
                          ? "bg-gradient-to-r from-emerald-100 to-green-100 dark:from-emerald-900 dark:to-green-900 text-emerald-800 dark:text-emerald-200 border-0" 
                          : "bg-gradient-to-r from-red-100 to-orange-100 dark:from-red-900 dark:to-orange-900 text-red-800 dark:text-red-200 border-0"
                        }
                      >
                        {company.isActive ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Active
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Inactive
                          </>
                        )}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                {company.id && (
                  <Button
                    onClick={openEditDialog}
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white border-0"
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-8">
              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {company.address && (
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <MapPin className="w-5 h-5 text-slate-500 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-slate-700 dark:text-slate-300">Address</div>
                      <div className="text-slate-600 dark:text-slate-400">{company.address}</div>
                    </div>
                  </div>
                )}
                
                {company.phone && (
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <Phone className="w-5 h-5 text-slate-500 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-slate-700 dark:text-slate-300">Phone</div>
                      <div className="text-slate-600 dark:text-slate-400">{company.phone}</div>
                    </div>
                  </div>
                )}
                
                {company.email && (
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <Mail className="w-5 h-5 text-slate-500 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-slate-700 dark:text-slate-300">Email</div>
                      <div className="text-slate-600 dark:text-slate-400">{company.email}</div>
                    </div>
                  </div>
                )}
                
                {company.website && (
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <Globe className="w-5 h-5 text-slate-500 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-slate-700 dark:text-slate-300">Website</div>
                      <a 
                        href={company.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {company.website}
                      </a>
                    </div>
                  </div>
                )}
                
                {company.industry && (
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <Building2 className="w-5 h-5 text-slate-500 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-slate-700 dark:text-slate-300">Industry</div>
                      <div className="text-slate-600 dark:text-slate-400">{company.industry}</div>
                    </div>
                  </div>
                )}
                
                {company.established && (
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <Calendar className="w-5 h-5 text-slate-500 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-slate-700 dark:text-slate-300">Established</div>
                      <div className="text-slate-600 dark:text-slate-400">
                        {new Date(company.established).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Legal Information */}
              {(company.taxId || company.businessLicense) && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Legal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {company.taxId && (
                      <div className="flex items-start gap-3 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                        <FileText className="w-5 h-5 text-slate-500 mt-0.5" />
                        <div>
                          <div className="text-sm font-medium text-slate-700 dark:text-slate-300">Tax ID</div>
                          <div className="text-slate-600 dark:text-slate-400">{company.taxId}</div>
                        </div>
                      </div>
                    )}
                    
                    {company.businessLicense && (
                      <div className="flex items-start gap-3 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                        <FileText className="w-5 h-5 text-slate-500 mt-0.5" />
                        <div>
                          <div className="text-sm font-medium text-slate-700 dark:text-slate-300">Business License</div>
                          <div className="text-slate-600 dark:text-slate-400">{company.businessLicense}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Description */}
              {company.description && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Description</h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    {company.description}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl">
            <CardContent className="p-12 text-center">
              <Building2 className="w-16 h-16 mx-auto mb-4 text-slate-400" />
              <h2 className="text-xl font-semibold text-slate-600 dark:text-slate-400 mb-2">No Company Profile</h2>
              <p className="text-slate-500 dark:text-slate-500 mb-6">Create a company profile to get started</p>
              <Button
                onClick={() => setIsCreateDialogOpen(true)}
                className="bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white border-0"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Company Profile
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-2xl border-0 shadow-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="space-y-3">
              <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                  <Edit2 className="w-5 h-5" />
                </div>
                Edit Company Profile
              </DialogTitle>
              <DialogDescription className="text-base text-slate-600 dark:text-slate-400">
                Update your company information and details
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              <AnimatedInput
                label="Company Code"
                value={updateForm.companyCode || ''}
                onChange={(e) => {
                  setUpdateForm({ ...updateForm, companyCode: e.target.value })
                  if (updateFormErrors.companyCode) {
                    setUpdateFormErrors({ ...updateFormErrors, companyCode: '' })
                  }
                }}
                error={updateFormErrors.companyCode}
                placeholder="e.g., PKS001, MILL01"
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AnimatedInput
                  label="Company Name"
                  value={updateForm.name || ''}
                  onChange={(e) => {
                    setUpdateForm({ ...updateForm, name: e.target.value })
                    if (updateFormErrors.name) {
                      setUpdateFormErrors({ ...updateFormErrors, name: '' })
                    }
                  }}
                  error={updateFormErrors.name}
                />
                <AnimatedInput
                  label="Business Name"
                  value={updateForm.businessName || ''}
                  onChange={(e) => setUpdateForm({ ...updateForm, businessName: e.target.value })}
                />
              </div>
              
              <AnimatedInput
                label="Address"
                value={updateForm.address || ''}
                onChange={(e) => setUpdateForm({ ...updateForm, address: e.target.value })}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AnimatedInput
                  label="Phone"
                  value={updateForm.phone || ''}
                  onChange={(e) => setUpdateForm({ ...updateForm, phone: e.target.value })}
                />
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
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AnimatedInput
                  label="Website"
                  value={updateForm.website || ''}
                  onChange={(e) => {
                    setUpdateForm({ ...updateForm, website: e.target.value })
                    if (updateFormErrors.website) {
                      setUpdateFormErrors({ ...updateFormErrors, website: '' })
                    }
                  }}
                  error={updateFormErrors.website}
                  placeholder="https://example.com"
                />
                <AnimatedInput
                  label="Industry"
                  value={updateForm.industry || ''}
                  onChange={(e) => setUpdateForm({ ...updateForm, industry: e.target.value })}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AnimatedInput
                  label="Tax ID"
                  value={updateForm.taxId || ''}
                  onChange={(e) => setUpdateForm({ ...updateForm, taxId: e.target.value })}
                />
                <AnimatedInput
                  label="Business License"
                  value={updateForm.businessLicense || ''}
                  onChange={(e) => setUpdateForm({ ...updateForm, businessLicense: e.target.value })}
                />
              </div>
              
              <AnimatedInput
                label="Established Date"
                type="date"
                value={updateForm.established || ''}
                onChange={(e) => setUpdateForm({ ...updateForm, established: e.target.value })}
              />
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Description
                </label>
                <Textarea
                  value={updateForm.description || ''}
                  onChange={(e) => setUpdateForm({ ...updateForm, description: e.target.value })}
                  placeholder="Brief description of your company..."
                  className="min-h-[100px] bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-slate-200 dark:border-slate-700"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button 
                  onClick={handleUpdateCompany} 
                  className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white border-0 h-12"
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Update Profile
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