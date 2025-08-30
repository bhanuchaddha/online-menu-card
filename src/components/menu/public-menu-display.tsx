'use client'
import { useState } from 'react'
import { RestaurantData, MenuData } from '@/lib/menu-service'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MapPin, Phone, Globe } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface PublicMenuDisplayProps {
  restaurant: RestaurantData
  menus: MenuData[]
}

interface MenuItem {
  name: string
  description?: string
  price: string
  dietary_info?: string[]
}

interface MenuCategory {
  name:string
  items: MenuItem[]
}

export function PublicMenuDisplay({ restaurant, menus }: PublicMenuDisplayProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const allCategories: MenuCategory[] = menus.reduce((acc: MenuCategory[], menu) => {
    if (menu.extractedData?.categories) {
      menu.extractedData.categories.forEach(category => {
        const existingCategory = acc.find(c => c.name === category.name)
        if (existingCategory) {
          existingCategory.items.push(...category.items)
        } else {
          acc.push({ name: category.name, items: [...category.items] })
        }
      })
    }
    return acc
  }, [])

  const filteredCategories = selectedCategory === 'all'
    ? allCategories
    : allCategories.filter(cat => cat.name === selectedCategory)

  if (allCategories.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center font-sans">
        <div className="text-center p-6">
          <h1 className="text-4xl font-serif text-gray-800 mb-2">{restaurant.name}</h1>
          <p className="text-lg text-gray-500">Menu coming soon...</p>
        </div>
      </div>
    )
  }

  const decorativeLine = () => <div className="w-24 h-px bg-gray-300 mx-auto my-6" />

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-800 py-12 md:py-20 px-4">
      <main className="max-w-4xl mx-auto">
        {/* Menu Card Container */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-lg shadow-xl border border-stone-200 overflow-hidden"
        >
          {/* Restaurant Header */}
          <header className="text-center p-8 md:p-12 bg-white">
            <h1 className="text-5xl md:text-6xl font-serif font-bold text-stone-900 tracking-tight">
              {restaurant.name}
            </h1>
            {restaurant.description && (
              <p className="mt-4 text-lg text-stone-600 max-w-2xl mx-auto">
                {restaurant.description}
              </p>
            )}
            {decorativeLine()}
            <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 text-stone-600">
              {restaurant.address && (
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>{restaurant.address}</span>
                </div>
              )}
              {restaurant.phone && (
                <div className="flex items-center">
                  <Phone className="w-4 h-4 mr-2" />
                  <a href={`tel:${restaurant.phone}`} className="hover:text-stone-900 transition-colors">
                    {restaurant.phone}
                  </a>
                </div>
              )}
              {restaurant.website && (
                <div className="flex items-center">
                  <Globe className="w-4 h-4 mr-2" />
                  <a href={restaurant.website} target="_blank" rel="noopener noreferrer" className="hover:text-stone-900 transition-colors">
                    Visit Website
                  </a>
                </div>
              )}
            </div>
          </header>

          {/* Category Filter */}
          <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-y border-stone-200 px-4 py-3">
            <div className="max-w-md mx-auto">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full font-serif text-lg">
                  <SelectValue placeholder="Select a category..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {allCategories.map(cat => (
                    <SelectItem key={cat.name} value={cat.name}>
                      {cat.name} ({cat.items.length})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Menu Content */}
          <div className="p-6 md:p-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedCategory}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="space-y-12"
              >
                {filteredCategories.map((category) => (
                  <section key={category.name}>
                    <h2 className="text-4xl font-serif font-bold text-center text-stone-800 mb-8">
                      {category.name}
                    </h2>
                    <ul className="space-y-6">
                      {category.items.map((item, itemIndex) => (
                        <li key={`${item.name}-${itemIndex}`} className="grid grid-cols-1 md:grid-cols-4 gap-x-4">
                          <div className="md:col-span-3">
                            <h3 className="text-xl font-bold font-serif text-stone-900">
                              {item.name}
                            </h3>
                            {item.description && (
                              <p className="mt-1 text-stone-600">
                                {item.description}
                              </p>
                            )}
                            {item.dietary_info && item.dietary_info.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-2">
                                {item.dietary_info.map((info, index) => (
                                  <Badge key={index} variant="outline" className="font-normal">
                                    {info}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="md:col-span-1 text-left md:text-right mt-2 md:mt-0">
                            <span className="text-xl font-semibold text-stone-800">
                              ${item.price}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
        
        {/* Footer */}
        <footer className="text-center mt-12">
          <p className="text-stone-500">
            Powered by <a href="#" className="font-semibold hover:text-stone-800">MenuCard</a>
          </p>
        </footer>
      </main>
    </div>
  )
}
