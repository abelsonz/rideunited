import { useState, useEffect } from 'react';
import { X, User, Lock, Trash2, AlertTriangle, Loader2, Save } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { supabase } from '../utils/supabase/client';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";

interface AccountSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onLogout: () => void;
}

export function AccountSettingsModal({ isOpen, onClose, user, onLogout }: AccountSettingsModalProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'danger'>('profile');
  const [isLoading, setIsLoading] = useState(false);
  
  // Profile state
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || '');
  
  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: fullName }
      });

      if (error) throw error;
      
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    
    try {
      // Verify current password first
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword
      });

      if (signInError) {
        throw new Error('Incorrect current password');
      }

      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;
      
      toast.success('Password updated successfully');
      setCurrentPassword('');
      setPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsLoading(true);
    
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      if (!token) {
        throw new Error('No active session');
      }

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-8e620cdb/delete-account`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete account');
      }

      toast.success('Account deleted successfully');
      onClose();
      onLogout();
      
    } catch (error: any) {
      console.error('Delete account error:', error);
      toast.error(error.message || 'Failed to delete account');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden relative animate-in zoom-in-95 duration-200 flex flex-col md:flex-row h-[600px] md:h-[500px]" onClick={(e) => e.stopPropagation()}>
        
        {/* Close Button (Mobile) */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 md:hidden text-gray-400 hover:text-gray-600 z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Sidebar */}
        <div className="w-full md:w-64 bg-gray-50 border-b md:border-b-0 md:border-r border-gray-200 p-6 flex-shrink-0">
          <h2 className="text-xl font-bold text-[#1E293B] mb-6">Settings</h2>
          
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'profile' 
                  ? 'bg-white text-[#10B981] shadow-sm ring-1 ring-gray-200' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <User className="w-4 h-4" />
              Profile
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'security' 
                  ? 'bg-white text-[#10B981] shadow-sm ring-1 ring-gray-200' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Lock className="w-4 h-4" />
              Security
            </button>
            <button
              onClick={() => setActiveTab('danger')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'danger' 
                  ? 'bg-red-50 text-red-600 ring-1 ring-red-200' 
                  : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
              }`}
            >
              <Trash2 className="w-4 h-4" />
              Delete Account
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="flex-grow p-6 md:p-8 overflow-y-auto relative">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 hidden md:block text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {activeTab === 'profile' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Profile Information</h3>
                <p className="text-sm text-gray-500">Update your account profile details.</p>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-md">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    value={user?.email} 
                    disabled 
                    className="bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-400">Email cannot be changed.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input 
                    id="fullName" 
                    value={fullName} 
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="bg-[#10B981] hover:bg-[#059669] text-white"
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                  Save Changes
                </Button>
              </form>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Security</h3>
                <p className="text-sm text-gray-500">Manage your password and account security.</p>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input 
                    id="currentPassword" 
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <Input 
                    id="password" 
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input 
                    id="confirmPassword" 
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="bg-[#10B981] hover:bg-[#059669] text-white"
                  disabled={isLoading || !password || !currentPassword}
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Lock className="w-4 h-4 mr-2" />}
                  Update Password
                </Button>
              </form>
            </div>
          )}

          {activeTab === 'danger' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h3 className="text-lg font-medium text-red-600">Danger Zone</h3>
                <p className="text-sm text-gray-500">Irreversible actions for your account.</p>
              </div>

              <div className="bg-red-50 border border-red-100 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-red-900">Delete Account</h4>
                    <p className="text-sm text-red-700 mt-1">
                      Once you delete your account, there is no going back. This will permanently delete your account, submitted routes, and remove your data from our servers.
                    </p>
                  </div>
                </div>
                
                <div className="mt-4">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" disabled={isLoading}>
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
                        Delete My Account
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete your account and remove your data from our servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteAccount} className="bg-red-600 hover:bg-red-700 focus:ring-red-600">
                          Yes, Delete Account
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
