
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import MainLayout from '@/layouts/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Avatar from '@/components/Avatar';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Save, Loader2 } from 'lucide-react';

const ProfilePage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [profile, setProfile] = useState<{
    username: string | null;
    avatar_url: string | null;
    created_at: string;
    onboarding_completed: boolean;
  }>({
    username: '',
    avatar_url: null,
    created_at: '',
    onboarding_completed: false
  });

  // Load profile data
  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        setProfile({
          username: data.username || user.email?.split('@')[0] || '',
          avatar_url: data.avatar_url,
          created_at: data.created_at,
          onboarding_completed: data.onboarding_completed || false
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast({
          title: 'Error',
          description: 'Could not load profile information',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, toast]);

  // Update profile
  const updateProfile = async () => {
    if (!user) return;

    try {
      setUpdating(true);
      const { error } = await supabase
        .from('profiles')
        .update({
          username: profile.username,
          avatar_url: profile.avatar_url,
          onboarding_completed: profile.onboarding_completed
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: 'Profile updated',
        description: 'Your profile has been successfully updated',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: 'Could not update profile information',
        variant: 'destructive',
      });
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="container mx-auto"
      >
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <Card className="w-full md:w-72">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center">
                <div className="mb-4">
                  <Avatar size="lg" />
                </div>
                <h2 className="text-xl font-bold mb-1">{profile.username || 'User'}</h2>
                <p className="text-sm text-muted-foreground mb-4">{user?.email}</p>
                <Button 
                  className="w-full mb-2"
                  onClick={updateProfile}
                  disabled={updating}
                >
                  {updating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>Save Profile</>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="flex-1">
            <Tabs defaultValue="account" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="account">Account</TabsTrigger>
                <TabsTrigger value="preferences">Preferences</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
              </TabsList>
              
              <TabsContent value="account" className="space-y-4 pt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Account Information</CardTitle>
                    <CardDescription>Update your account information</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input 
                        id="username" 
                        value={profile.username || ''}
                        onChange={(e) => setProfile({...profile, username: e.target.value})}
                        placeholder="Your username"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        value={user?.email || ''}
                        disabled
                        className="bg-muted"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Email cannot be changed
                      </p>
                    </div>
                    <div className="space-y-1">
                      <Label>Member Since</Label>
                      <p className="text-sm p-2 bg-muted rounded">
                        {profile.created_at ? formatDate(profile.created_at) : 'Loading...'}
                      </p>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="ml-auto"
                      onClick={updateProfile}
                      disabled={updating}
                    >
                      {updating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Achievements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      You've earned 3 out of 12 possible achievements.
                    </p>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="p-2 border rounded-md bg-green-50 border-green-200">
                        <span className="block text-xl mb-1">🔥</span>
                        <span className="text-sm font-medium">7-Day Streak</span>
                      </div>
                      <div className="p-2 border rounded-md bg-green-50 border-green-200">
                        <span className="block text-xl mb-1">🚀</span>
                        <span className="text-sm font-medium">First Habit</span>
                      </div>
                      <div className="p-2 border rounded-md bg-green-50 border-green-200">
                        <span className="block text-xl mb-1">⭐</span>
                        <span className="text-sm font-medium">Perfect Week</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="preferences" className="pt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>User Preferences</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Customize your app experience with these settings.
                    </p>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Daily Reminders</p>
                          <p className="text-sm text-muted-foreground">Get notifications for your habits</p>
                        </div>
                        <Button variant="outline">Configure</Button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Theme</p>
                          <p className="text-sm text-muted-foreground">Choose light or dark mode</p>
                        </div>
                        <Button variant="outline">Light</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="notifications" className="pt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Settings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Manage how and when you receive notifications.
                    </p>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Push Notifications</p>
                          <p className="text-sm text-muted-foreground">Receive alerts on your device</p>
                        </div>
                        <Button variant="outline">Enabled</Button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Email Digests</p>
                          <p className="text-sm text-muted-foreground">Weekly summary of your progress</p>
                        </div>
                        <Button variant="outline">Disabled</Button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Quiet Hours</p>
                          <p className="text-sm text-muted-foreground">Don't disturb during these times</p>
                        </div>
                        <Button variant="outline">Configure</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </motion.div>
    </MainLayout>
  );
};

export default ProfilePage;
