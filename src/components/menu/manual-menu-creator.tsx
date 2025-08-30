'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, Save } from 'lucide-react'
import { toast } from 'sonner'

interface MenuItem {
  name: string
  description: string
  price: string
  dietary_info: string[]
}

interface MenuCategory {
  name: string
  items: MenuItem[]
}

interface ManualMenuCreatorProps {
  onSave: (menuData: { restaurant_name: string; categories: MenuCategory[] }) => void
  onCancel: () => void
}

export function ManualMenuCreator({ onSave, onCancel }: ManualMenuCreatorProps) {
  const [restaurantName, setRestaurantName] = useState('')
  const [categories, setCategories] = useState<MenuCategory[]>([
    { name: 'Appetizers', items: [] }
  ])
  const [isSaving, setIsSaving] = useState(false)

  const addCategory = () => {
    setCategories([...categories, { name: '', items: [] }])
  }

  const updateCategoryName = (categoryIndex: number, name: string) => {
    const updated = [...categories]
    updated[categoryIndex].name = name
    setCategories(updated)
  }

  const removeCategory = (categoryIndex: number) => {
    if (categories.length > 1) {
      const updated = categories.filter((_, index) => index !== categoryIndex)
      setCategories(updated)
    }
  }

  const addItem = (categoryIndex: number) => {
    const updated = [...categories]
    updated[categoryIndex].items.push({
      name: '',
      description: '',
      price: '',
      dietary_info: []
    })
    setCategories(updated)
  }

  const updateItem = (categoryIndex: number, itemIndex: number, field: keyof MenuItem, value: string | string[]) => {
    const updated = [...categories]
    updated[categoryIndex].items[itemIndex][field] = value as any
    setCategories(updated)
  }

  const removeItem = (categoryIndex: number, itemIndex: number) => {
    const updated = [...categories]
    updated[categoryIndex].items.splice(itemIndex, 1)
    setCategories(updated)
  }

  const addDietaryInfo = (categoryIndex: number, itemIndex: number, info: string) => {
    if (!info.trim()) return
    
    const updated = [...categories]
    const currentInfo = updated[categoryIndex].items[itemIndex].dietary_info
    if (!currentInfo.includes(info)) {
      updated[categoryIndex].items[itemIndex].dietary_info = [...currentInfo, info]
      setCategories(updated)
    }
  }

  const removeDietaryInfo = (categoryIndex: number, itemIndex: number, info: string) => {
    const updated = [...categories]
    updated[categoryIndex].items[itemIndex].dietary_info = 
      updated[categoryIndex].items[itemIndex].dietary_info.filter(item => item !== info)
    setCategories(updated)
  }

  const handleSave = async () => {
    // Validation
    if (!restaurantName.trim()) {
      toast.error('Restaurant name is required')
      return
    }

    const validCategories = categories.filter(cat => cat.name.trim() && cat.items.length > 0)
    if (validCategories.length === 0) {
      toast.error('At least one category with items is required')
      return
    }

    // Check if all items have required fields
    for (const category of validCategories) {
      for (const item of category.items) {
        if (!item.name.trim() || !item.price.trim()) {
          toast.error(`All items must have a name and price`)
          return
        }
      }
    }

    setIsSaving(true)
    try {
      const menuData = {
        restaurant_name: restaurantName.trim(),
        categories: validCategories
      }
      
      await onSave(menuData)
      toast.success('Menu created successfully!')
    } catch (error) {
      console.error('Error saving menu:', error)
      toast.error('Failed to create menu. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const dietaryOptions = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Spicy', 'Dairy-Free', 'Nut-Free']

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create Menu Manually</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="restaurant-name">Restaurant Name *</Label>
            <Input
              id="restaurant-name"
              value={restaurantName}
              onChange={(e) => setRestaurantName(e.target.value)}
              placeholder="Enter restaurant name"
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      {categories.map((category, categoryIndex) => (
        <Card key={categoryIndex}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <Input
                  value={category.name}
                  onChange={(e) => updateCategoryName(categoryIndex, e.target.value)}
                  placeholder="Category name (e.g., Appetizers, Main Course)"
                  className="font-semibold text-lg"
                />
              </div>
              {categories.length > 1 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeCategory(categoryIndex)}
                  className="ml-2 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {category.items.map((item, itemIndex) => (
              <div key={itemIndex} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Item {itemIndex + 1}</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeItem(categoryIndex, itemIndex)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Item Name *</Label>
                    <Input
                      value={item.name}
                      onChange={(e) => updateItem(categoryIndex, itemIndex, 'name', e.target.value)}
                      placeholder="e.g., Caesar Salad"
                    />
                  </div>
                  <div>
                    <Label>Price *</Label>
                    <Input
                      value={item.price}
                      onChange={(e) => updateItem(categoryIndex, itemIndex, 'price', e.target.value)}
                      placeholder="e.g., 12.99"
                    />
                  </div>
                </div>

                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={item.description}
                    onChange={(e) => updateItem(categoryIndex, itemIndex, 'description', e.target.value)}
                    placeholder="Describe the dish..."
                    rows={2}
                  />
                </div>

                <div>
                  <Label>Dietary Information</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {dietaryOptions.map((option) => (
                      <Button
                        key={option}
                        variant={item.dietary_info.includes(option) ? "default" : "outline"}
                        size="sm"
                        onClick={() => 
                          item.dietary_info.includes(option)
                            ? removeDietaryInfo(categoryIndex, itemIndex, option)
                            : addDietaryInfo(categoryIndex, itemIndex, option)
                        }
                      >
                        {option}
                      </Button>
                    ))}
                  </div>
                  {item.dietary_info.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {item.dietary_info.map((info) => (
                        <Badge key={info} variant="secondary">
                          {info}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            <Button
              variant="outline"
              onClick={() => addItem(categoryIndex)}
              className="w-full border-dashed"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Item to {category.name || 'Category'}
            </Button>
          </CardContent>
        </Card>
      ))}

      <div className="flex space-x-4">
        <Button variant="outline" onClick={addCategory} className="flex-1">
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </Button>
      </div>

      <div className="flex space-x-4 pt-6">
        <Button variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button 
          onClick={handleSave} 
          disabled={isSaving}
          className="flex-1"
        >
          {isSaving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Menu
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
