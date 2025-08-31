'use client'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ArrowLeft, Save, Globe, Phone, MapPin, ExternalLink, Camera, PlusCircle, Trash2, Edit } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { MenuCamera } from '@/components/camera/menu-camera'
import { EditableMenuForm } from '@/components/menu/editable-menu-form'

interface RestaurantData {
  id?: string
  name: string
  description?: string
  address?: string
  phone?: string
  website?: string
  latitude?: number | null
  longitude?: number | null
  slug?: string
  menu?: {
    id: string;
    restaurant_name: string;
    extractedData: any;
  } | null;
}

export default function RestaurantProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [restaurant, setRestaurant] = useState<RestaurantData | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  
  const [editingMenu, setEditingMenu] = useState<any | null>(null)
  const [showCamera, setShowCamera] = useState(false)

  const loadRestaurantProfile = useCallback(async () => {
    try {
      const response = await fetch('/api/restaurant/profile')
      if (response.ok) {
        const data = await response.json()
        if (data.restaurant) {
          setRestaurant(data.restaurant)
        }
      }
    } catch (error) {
      console.error('Error loading restaurant profile:', error)
    } finally {
      setIsInitialLoading(false)
    }
  }, [status, router])

  useEffect(() => {
    loadRestaurantProfile()
  }, [loadRestaurantProfile])

  const handleInputChange = (field: keyof RestaurantData, value: string) => {
    setRestaurant(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  }

  const handleLocationChange = useCallback((location: [number, number] | null) => {
    setRestaurant(prev => ({
      ...prev,
      latitude: location ? location[0] : null,
      longitude: location ? location[1] : null,
    }))
  }, [])

  const handleAddressChange = (address: string) => {
    handleInputChange('address', address)
  }

  const handleSave = async () => {
    if (!restaurant?.name.trim()) {
      toast.error('Restaurant name is required')
      return
    }

    setIsSaving(true)
    try {
      const restaurantData = {
        ...restaurant,
        slug: generateSlug(restaurant.name)
      }

      const response = await fetch('/api/restaurant/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(restaurantData),
      })

      if (response.ok) {
        const data = await response.json()
        setRestaurant(data.restaurant)
        toast.success('Restaurant profile saved successfully!')
      } else {
        throw new Error('Failed to save restaurant profile')
      }
    } catch (error) {
      console.error('Error saving restaurant profile:', error)
      toast.error('Failed to save restaurant profile. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleImageCapture = async (imageSrc: string) => {
    console.log('Image captured, extracting menu data...');
    setShowCamera(false); // Close camera dialog
    setIsSaving(true);
    
    try {
      // Call the menu extraction API
      const response = await fetch('/api/menu/extract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageData: imageSrc,
          isManual: false
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Menu extraction successful:', result);
        
        // Set the extracted data for editing
        setEditingMenu(result.extractedData);
        toast.success('Menu extracted successfully! You can now edit it.');
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to extract menu');
      }
    } catch (error) {
      console.error('Error extracting menu:', error);
      toast.error('Failed to extract menu from image. Please try again or create manually.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveMenu = async (data: any) => {
    // Logic to call upsert API
    console.log('Saving menu data:', data);
    setIsSaving(true);
    try {
      const response = await fetch('/api/menu/upsert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        setRestaurant(prev => ({
          ...prev,
          menu: result.menu,
        }));
        toast.success('Menu saved successfully!');
      } else {
        throw new Error('Failed to save menu');
      }
    } catch (error) {
      console.error('Error saving menu:', error);
      toast.error('Failed to save menu. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };
  
  const deleteMenu = async () => {
    // Logic to call delete API
    console.log('Deleting menu');
    setIsSaving(true);
    try {
      const response = await fetch('/api/menu/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ menuId: restaurant?.menu?.id }),
      });

      if (response.ok) {
        const result = await response.json();
        setRestaurant(prev => ({
          ...prev,
          menu: null,
        }));
        toast.success('Menu deleted successfully!');
      } else {
        throw new Error('Failed to delete menu');
      }
    } catch (error) {
      console.error('Error deleting menu:', error);
      toast.error('Failed to delete menu. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (status === 'loading' || isInitialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const publicMenuUrl = restaurant?.slug 
    ? `${window.location.origin}/menu/${restaurant.slug}`
    : null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Restaurant Profile</h1>
              <p className="text-sm text-gray-600">Manage your restaurant information</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Profile & Actions */}
          <div className="lg:col-span-1 space-y-8">
            {/* Restaurant Profile Card */}
            <Card>
              <CardHeader>
                <CardTitle>Restaurant Information</CardTitle>
                <CardDescription>
                  This information will be displayed on your public menu page
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="name">Restaurant Name *</Label>
                  <Input
                    id="name"
                    value={restaurant?.name || ''}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter your restaurant name"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={restaurant?.description || ''}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Tell customers about your restaurant..."
                    rows={3}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="address">Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="address"
                      value={restaurant?.address || ''}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="123 Main St, City, State 12345"
                      className="pl-10 mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="phone"
                      value={restaurant?.phone || ''}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="(555) 123-4567"
                      className="pl-10 mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="website">Website</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="website"
                      value={restaurant?.website || ''}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      placeholder="https://yourrestaurant.com"
                      className="pl-10 mt-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <Button onClick={handleSave} disabled={isSaving} className="w-full">
                  {isSaving ? 'Saving...' : 'Save Profile'}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Menu Management */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Menu Management</CardTitle>
                <CardDescription>
                  {restaurant?.menu ? 'Edit your existing menu.' : 'Add a menu to your restaurant.'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {restaurant?.menu ? (
                   <div className="space-y-4">
                     <p className="font-semibold">{restaurant.menu.restaurantName}</p>
                     <div className="flex flex-wrap items-center gap-4">
                       <Button variant="outline" onClick={() => setEditingMenu(restaurant.menu?.extractedData)}>
                         <Edit className="w-4 h-4 mr-2" /> Edit Menu
                       </Button>
                       <Button variant="destructive" onClick={deleteMenu}>
                         <Trash2 className="w-4 h-4 mr-2" /> Delete Menu
                       </Button>
                        <Link href={`/menu/${restaurant.slug}`} target="_blank">
                         <Button variant="outline"><ExternalLink className="w-4 h-4 mr-2" />View Public Menu</Button>
                       </Link>
                     </div>
                   </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-4">
                    <Button onClick={() => setShowCamera(true)}>
                      <Camera className="w-4 h-4 mr-2" /> Add Menu from Photo
                    </Button>
                    <Button variant="outline" onClick={() => setEditingMenu({ categories: [] })}>
                      <PlusCircle className="w-4 h-4 mr-2" /> Create Menu Manually
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Dialogs for Camera and Edit Form */}
      <Dialog open={showCamera} onOpenChange={setShowCamera}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Take a Photo of Your Menu</DialogTitle>
          </DialogHeader>
          <MenuCamera onCapture={handleImageCapture} />
        </DialogContent>
      </Dialog>
      <Dialog open={!!editingMenu} onOpenChange={() => setEditingMenu(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Menu</DialogTitle>
          </DialogHeader>
          <EditableMenuForm
            initialData={editingMenu}
            restaurantId={restaurant?.id}
            onSave={handleSaveMenu}
            onCancel={() => setEditingMenu(null)}
            isSaving={isSaving}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
