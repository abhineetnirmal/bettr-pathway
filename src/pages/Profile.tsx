
import React from 'react';
import { motion } from 'framer-motion';
import MainLayout from '@/layouts/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Avatar from '@/components/Avatar';

const ProfilePage = () => {
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
                <h2 className="text-xl font-bold mb-1">Alex Johnson</h2>
                <p className="text-sm text-muted-foreground mb-4">alex@example.com</p>
                <Button className="w-full mb-2">Edit Profile</Button>
                <Button variant="outline" className="w-full">Settings</Button>
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
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Name</p>
                        <p className="font-medium">Alex Johnson</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">alex@example.com</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Member Since</p>
                        <p className="font-medium">January 15, 2023</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Subscription</p>
                        <p className="font-medium">Free Plan</p>
                      </div>
                    </div>
                  </CardContent>
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
