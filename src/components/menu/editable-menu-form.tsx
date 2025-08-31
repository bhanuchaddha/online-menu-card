'use client'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { X, Plus } from 'lucide-react'

// Interfaces to match the data structure
interface MenuItem {
  name: string
  description?: string
  price: string
}

interface MenuCategory {
  name: string
  items: MenuItem[]
}

interface MenuData {
  restaurant_name?: string
  categories: MenuCategory[]
}

interface EditableMenuFormProps {
  initialData: MenuData
  restaurantId: string | undefined
  onSave: (data: MenuData & { restaurantId: string | undefined }) => void
  onCancel: () => void
  isSaving: boolean
}

export function EditableMenuForm({ initialData, restaurantId, onSave, onCancel, isSaving }: EditableMenuFormProps) {
  const [menuData, setMenuData] = useState<MenuData>({
    ...initialData,
    categories: initialData?.categories || [],
  })

  useEffect(() => {
    setMenuData({
      ...initialData,
      categories: initialData?.categories || [],
    })
  }, [initialData])

  const handleCategoryChange = (catIndex: number, field: string, value: string) => {
    const newCategories = [...menuData.categories]
    newCategories[catIndex] = { ...newCategories[catIndex], [field]: value }
    setMenuData({ ...menuData, categories: newCategories })
  }

  const handleItemChange = (catIndex: number, itemIndex: number, field: string, value: string) => {
    const newCategories = [...menuData.categories]
    const newItems = [...newCategories[catIndex].items]
    newItems[itemIndex] = { ...newItems[itemIndex], [field]: value }
    newCategories[catIndex].items = newItems
    setMenuData({ ...menuData, categories: newCategories })
  }
  
  const addCategory = () => {
    const newCategories = [...menuData.categories, { name: 'New Category', items: [{ name: 'New Item', price: '0.00' }] }]
    setMenuData({ ...menuData, categories: newCategories })
  }

  const addItem = (catIndex: number) => {
    const newCategories = [...menuData.categories]
    newCategories[catIndex].items.push({ name: 'New Item', price: '0.00', description: '' })
    setMenuData({ ...menuData, categories: newCategories })
  }
  
  const removeCategory = (catIndex: number) => {
    const newCategories = menuData.categories.filter((_, i) => i !== catIndex)
    setMenuData({ ...menuData, categories: newCategories })
  }

  const removeItem = (catIndex: number, itemIndex: number) => {
    const newCategories = [...menuData.categories]
    newCategories[catIndex].items = newCategories[catIndex].items.filter((_, i) => i !== itemIndex)
    setMenuData({ ...menuData, categories: newCategories })
  }

  return (
    <div className="space-y-6 p-1">

      {menuData.categories.map((category, catIndex) => (
        <div key={catIndex} className="p-4 border rounded-lg space-y-4 bg-gray-50">
          <div className="flex justify-between items-center">
            <Input 
              value={category.name} 
              onChange={(e) => handleCategoryChange(catIndex, 'name', e.target.value)}
              className="text-xl font-bold"
            />
            <Button variant="ghost" size="sm" onClick={() => removeCategory(catIndex)}><X className="h-4 w-4" /></Button>
          </div>
          
          {category.items.map((item, itemIndex) => (
            <div key={itemIndex} className="grid grid-cols-12 gap-2 items-start">
              <div className="col-span-4">
                <Input 
                  placeholder="Item Name"
                  value={item.name} 
                  onChange={(e) => handleItemChange(catIndex, itemIndex, 'name', e.target.value)} 
                />
              </div>
              <div className="col-span-6">
                 <Textarea 
                   placeholder="Description"
                   value={item.description || ''} 
                   onChange={(e) => handleItemChange(catIndex, itemIndex, 'description', e.target.value)} 
                   rows={1}
                 />
              </div>
              <div className="col-span-2">
                <Input 
                  placeholder="Price"
                  value={item.price} 
                  onChange={(e) => handleItemChange(catIndex, itemIndex, 'price', e.target.value)} 
                />
              </div>
              <div className="col-span-12 flex justify-end">
                <Button variant="ghost" size="sm" onClick={() => removeItem(catIndex, itemIndex)}>Remove Item</Button>
              </div>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={() => addItem(catIndex)}>
            <Plus className="h-4 w-4 mr-2" /> Add Item
          </Button>
        </div>
      ))}
      
      <Button variant="outline" onClick={addCategory}>
        <Plus className="h-4 w-4 mr-2" /> Add Category
      </Button>

      <div className="flex justify-end gap-4 pt-4">
        <Button variant="outline" onClick={onCancel} disabled={isSaving}>Cancel</Button>
        <Button onClick={() => onSave({ ...menuData, restaurantId })} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Menu'}
        </Button>
      </div>
    </div>
  )
}
