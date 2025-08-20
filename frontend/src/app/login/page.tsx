"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Scale, Eye, EyeOff, Factory, Shield, CheckCircle, AlertCircle, Loader2, ArrowRight, Leaf } from 'lucide-react'
import { cn } from '@/lib/utils'
import { StatusMessage } from '@/components/ui/status-message'

export default function LoginPage() {
  const [credentials, setCredentials] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [formErrors, setFormErrors] = useState<{ username?: string; password?: string }>({})
  const [isFormValid, setIsFormValid] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const isValid = credentials.username.length >= 3 && credentials.password.length >= 6
    setIsFormValid(isValid)
  }, [credentials])

  const validateField = (field: string, value: string) => {
    const errors = { ...formErrors }
    
    if (field === 'username') {
      if (value.length === 0) {
        errors.username = 'Username is required'
      } else if (value.length < 3) {
        errors.username = 'Username must be at least 3 characters'
      } else {
        delete errors.username
      }
    }
    
    if (field === 'password') {
      if (value.length === 0) {
        errors.password = 'Password is required'
      } else if (value.length < 6) {
        errors.password = 'Password must be at least 6 characters'
      } else {
        delete errors.password
      }
    }
    
    setFormErrors(errors)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!isFormValid) {
      setError('Please fill in all fields correctly')
      return
    }
    
    setIsLoading(true)

    try {
      const loginResponse = await login(credentials)
      
      // Check user role and redirect accordingly
      const userRole = loginResponse?.role?.name || loginResponse?.userRole?.role?.name
      
      if (userRole === 'operator_timbangan') {
        router.push('/timbangan')
      } else {
        router.push('/')
      }
    } catch (error) {
      setError('Invalid username or password. Please check your credentials and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setCredentials(prev => ({ ...prev, [name]: value }))
    validateField(name, value)
    if (error) setError('')
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-slate-950 dark:via-emerald-950/20 dark:to-slate-950">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-200/30 dark:bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-200/30 dark:bg-green-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-100/20 dark:bg-teal-500/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Floating Particles Effect */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-emerald-300/20 dark:bg-emerald-400/10 rounded-full animate-bounce"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          ></div>
        ))}
      </div>

      <div className="relative z-10 min-h-screen flex">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12">
          <div className="max-w-md text-center space-y-8">
            <div className="relative">
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-300">
                <Scale className="h-12 w-12 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                <Leaf className="h-4 w-4 text-yellow-800" />
              </div>
            </div>
            
            <div className="space-y-4">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                SmartMillScale
              </h1>
              <p className="text-xl text-slate-600 dark:text-slate-300 font-medium">
                Timbang Otomatis, Proses Sistematis
              </p>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                Sistem timbangan otomatis yang mengintegrasikan proses penimbangan dan grading dengan teknologi digital yang efisien dan akurat.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-8">
              <div className="text-center p-4 rounded-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-emerald-200/50 dark:border-emerald-500/20">
                <Factory className="h-8 w-8 mx-auto mb-2 text-emerald-600 dark:text-emerald-400" />
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Timbangan Digital</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-emerald-200/50 dark:border-emerald-500/20">
                <Shield className="h-8 w-8 mx-auto mb-2 text-emerald-600 dark:text-emerald-400" />
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Sistem Aman</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
          <Card className="w-full max-w-md bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-0 shadow-2xl shadow-emerald-500/10 dark:shadow-emerald-500/5">
            <div className="p-8 lg:p-10 space-y-8">
              {/* Mobile Logo */}
              <div className="lg:hidden text-center">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg mb-4">
                  <Scale className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">SmartMillScale</h2>
                <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">Welcome back</p>
              </div>

              {/* Desktop Header */}
              <div className="hidden lg:block text-center">
                <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Welcome Back</h2>
                <p className="text-slate-600 dark:text-slate-400">Sign in to your SmartMillScale account</p>
              </div>

              {/* Error Message */}
              {error && (
                <StatusMessage
                  type="error"
                  message={error}
                  onClose={() => setError('')}
                />
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Username Field */}
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Username
                  </Label>
                  <div className="relative">
                    <Input
                      id="username"
                      name="username"
                      type="text"
                      placeholder="Enter your username"
                      value={credentials.username}
                      onChange={handleChange}
                      disabled={isLoading}
                      className={cn(
                        "h-12 pl-4 pr-10 text-base rounded-xl border-2 transition-all duration-200 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm",
                        formErrors.username 
                          ? "border-red-300 focus:border-red-500" 
                          : credentials.username && !formErrors.username
                          ? "border-emerald-300 focus:border-emerald-500"
                          : "border-slate-200 dark:border-slate-700 focus:border-emerald-500"
                      )}
                    />
                    {credentials.username && !formErrors.username && (
                      <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-emerald-500" />
                    )}
                  </div>
                  {formErrors.username && (
                    <p className="text-xs text-red-500 mt-1">{formErrors.username}</p>
                  )}
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={credentials.password}
                      onChange={handleChange}
                      disabled={isLoading}
                      className={cn(
                        "h-12 pl-4 pr-16 text-base rounded-xl border-2 transition-all duration-200 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm",
                        formErrors.password 
                          ? "border-red-300 focus:border-red-500" 
                          : credentials.password && !formErrors.password
                          ? "border-emerald-300 focus:border-emerald-500"
                          : "border-slate-200 dark:border-slate-700 focus:border-emerald-500"
                      )}
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                      {credentials.password && !formErrors.password && (
                        <CheckCircle className="h-5 w-5 text-emerald-500" />
                      )}
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                        disabled={isLoading}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-slate-500" />
                        ) : (
                          <Eye className="h-4 w-4 text-slate-500" />
                        )}
                      </button>
                    </div>
                  </div>
                  {formErrors.password && (
                    <p className="text-xs text-red-500 mt-1">{formErrors.password}</p>
                  )}
                </div>

                {/* Remember Me */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      disabled={isLoading}
                    />
                    <span className="text-sm text-slate-600 dark:text-slate-400">Remember me</span>
                  </label>
                  <button 
                    type="button" 
                    className="text-sm text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors"
                    disabled={isLoading}
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={!isFormValid || isLoading}
                  className={cn(
                    "w-full h-12 text-base font-medium rounded-xl transition-all duration-200 transform hover:scale-[1.02]",
                    isFormValid && !isLoading
                      ? "bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40"
                      : "bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                  )}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span>Sign In</span>
                      <ArrowRight className="h-5 w-5" />
                    </div>
                  )}
                </Button>
              </form>

              {/* Demo Credentials */}
              <div className="pt-6 border-t border-slate-200/50 dark:border-slate-700/50">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800/50 dark:to-slate-700/50 rounded-xl p-4 border border-blue-200/50 dark:border-slate-600/50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm font-medium text-blue-800 dark:text-blue-300">Demo Access</span>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setCredentials({ username: 'admin', password: 'admin123' })
                          setIsFormValid(true)
                        }}
                        disabled={isLoading}
                        className="text-xs h-7 px-3 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-800/40 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300"
                      >
                        Admin
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setCredentials({ username: 'operator', password: 'operator123' })
                          setIsFormValid(true)
                        }}
                        disabled={isLoading}
                        className="text-xs h-7 px-3 bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-800/40 border-green-300 dark:border-green-700 text-green-700 dark:text-green-300"
                      >
                        Operator
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-xs text-blue-700 dark:text-blue-300">
                    <div className="space-y-1">
                      <div className="font-medium text-blue-800 dark:text-blue-200">Admin (Full Access)</div>
                      <div className="flex justify-between">
                        <span>Username:</span>
                        <code className="font-mono bg-blue-100 dark:bg-blue-900/30 px-1 rounded">admin</code>
                      </div>
                      <div className="flex justify-between">
                        <span>Password:</span>
                        <code className="font-mono bg-blue-100 dark:bg-blue-900/30 px-1 rounded">admin123</code>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="font-medium text-green-800 dark:text-green-200">Operator (Weighing Only)</div>
                      <div className="flex justify-between">
                        <span>Username:</span>
                        <code className="font-mono bg-green-100 dark:bg-green-900/30 px-1 rounded">operator</code>
                      </div>
                      <div className="flex justify-between">
                        <span>Password:</span>
                        <code className="font-mono bg-green-100 dark:bg-green-900/30 px-1 rounded">operator123</code>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}