'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Trash2, Edit, Eye, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'

interface MenuData {
  id: string
  userId: string
  restaurantName: string
  imageUrl: string
  extractedData: {
    restaurant_name?: string
    categories: Array<{
      name: string
      items: Array<{
        name: string
        description?: string
        price: string
        dietary_info?: string[]
      }>
    }>
  }
  createdAt: string
  updatedAt: string
}

export function MenuList() {
  const [menus, setMenus] = useState<MenuData[]>([])
  const [loading, setLoading] = useState(true)

  const fetchMenus = async () => {
    try {
      const response = await fetch('/api/menu')
      const result = await response.json()
      
      if (result.success) {
        setMenus(result.data)
      } else {
        toast.error('Failed to load menus')
      }
    } catch (error) {
      console.error('Error fetching menus:', error)
      toast.error('Failed to load menus')
    } finally {
      setLoading(false)
    }
  }

  const deleteMenu = async (menuId: string) => {
    if (!confirm('Are you sure you want to delete this menu?')) return

    try {
      const response = await fetch(`/api/menu?id=${menuId}`, {
        method: 'DELETE'
      })
      
      const result = await response.json()
      
      if (result.success) {
        setMenus(menus.filter(menu => menu.id !== menuId))
        toast.success('Menu deleted successfully')
      } else {
        toast.error('Failed to delete menu')
      }
    } catch (error) {
      console.error('Error deleting menu:', error)
      toast.error('Failed to delete menu')
    }
  }

  useEffect(() => {
    fetchMenus()
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Your Menus</h2>
        <div className="grid gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (menus.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Your Menus</h2>
        <p className="text-muted-foreground mb-6">
          You haven&apos;t created any menus yet. Take a photo of your menu to get started!
        </p>
        <div className="w-48 h-32 mx-auto bg-gray-100 rounded-lg flex items-center justify-center">
          <Eye className="w-8 h-8 text-gray-400" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Your Menus</h2>
        <Badge variant="secondary">{menus.length} menu{menus.length !== 1 ? 's' : ''}</Badge>
      </div>

      <div className="grid gap-6">
        {menus.map((menu) => (
          <Card key={menu.id} className="overflow-hidden">
            <div className="md:flex">
              {/* Menu Image */}
              <div className="md:w-1/3">
                <div className="aspect-video md:aspect-square relative overflow-hidden">
                  <img
                    src={menu.imageUrl}
                    alt={`${menu.restaurantName} menu`}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Menu Content */}
              <div className="md:w-2/3">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">
                        {menu.extractedData.restaurant_name || menu.restaurantName}
                      </CardTitle>
                      <CardDescription>
                        Created {new Date(menu.createdAt).toLocaleDateString()}
                        {menu.updatedAt !== menu.createdAt && (
                          <span> • Updated {new Date(menu.updatedAt).toLocaleDateString()}</span>
                        )}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    {/* Categories Summary */}
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {menu.extractedData.categories.length} categories
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {menu.extractedData.categories.slice(0, 4).map((category, index) => (
                          <Badge key={index} variant="outline">
                            {category.name} ({category.items.length})
                          </Badge>
                        ))}
                        {menu.extractedData.categories.length > 4 && (
                          <Badge variant="outline">
                            +{menu.extractedData.categories.length - 4} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Public URL
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteMenu(menu.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
