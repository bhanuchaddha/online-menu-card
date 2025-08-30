'use client'
import { useState } from 'react'
import { RestaurantData, MenuData } from '@/lib/menu-service'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MapPin, Phone, Globe, Clock, Star, Heart, Share2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

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
  name: string
  items: MenuItem[]
}

export function PublicMenuDisplay({ restaurant, menus }: PublicMenuDisplayProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [currentTheme] = useState('modern') // Can be made dynamic later

  // Combine all menu items from all menus
  const allCategories: MenuCategory[] = []
  menus.forEach(menu => {
    if (menu.extractedData && menu.extractedData.categories) {
      menu.extractedData.categories.forEach(category => {
        const existingCategory = allCategories.find(c => c.name === category.name)
        if (existingCategory) {
          existingCategory.items.push(...category.items)
        } else {
          allCategories.push({
            name: category.name,
            items: [...category.items]
          })
        }
      })
    }
  })

  const toggleFavorite = (itemName: string) => {
    const newFavorites = new Set(favorites)
    if (newFavorites.has(itemName)) {
      newFavorites.delete(itemName)
    } else {
      newFavorites.add(itemName)
    }
    setFavorites(newFavorites)
  }

  const shareMenu = async () => {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${restaurant.name} - Digital Menu`,
          text: `Check out the menu at ${restaurant.name}!`,
          url: url,
        })
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback to clipboard
      await navigator.clipboard.writeText(url)
      toast.success('Menu link copied to clipboard!')
    }
  }

  const getDietaryBadgeColor = (info: string) => {
    switch (info.toLowerCase()) {
      case 'vegetarian': return 'bg-green-100 text-green-800'
      case 'vegan': return 'bg-green-200 text-green-900'
      case 'gluten-free': return 'bg-blue-100 text-blue-800'
      case 'spicy': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredCategories = selectedCategory
    ? allCategories.filter(cat => cat.name === selectedCategory)
    : allCategories

  if (allCategories.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{restaurant.name}</h1>
          <p className="text-gray-600">Menu coming soon...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${currentTheme === 'modern' ? 'bg-gradient-to-br from-gray-50 to-gray-100' : 'bg-white'}`}>
      {/* Restaurant Header */}
      <div className="relative">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-4xl font-bold mb-2"
                >
                  {restaurant.name}
                </motion.h1>
                
                {restaurant.description && (
                  <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-lg text-blue-100 mb-4"
                  >
                    {restaurant.description}
                  </motion.p>
                )}

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-2"
                >
                  {restaurant.address && (
                    <div className="flex items-center text-blue-100">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span className="text-sm">{restaurant.address}</span>
                    </div>
                  )}
                  
                  {restaurant.phone && (
                    <div className="flex items-center text-blue-100">
                      <Phone className="w-4 h-4 mr-2" />
                      <a href={`tel:${restaurant.phone}`} className="text-sm hover:text-white transition-colors">
                        {restaurant.phone}
                      </a>
                    </div>
                  )}
                  
                  {restaurant.website && (
                    <div className="flex items-center text-blue-100">
                      <Globe className="w-4 h-4 mr-2" />
                      <a 
                        href={restaurant.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm hover:text-white transition-colors"
                      >
                        Visit Website
                      </a>
                    </div>
                  )}
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Button 
                  onClick={shareMenu}
                  variant="secondary"
                  size="sm"
                  className="bg-white/20 hover:bg-white/30 text-white border-white/20"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Menu
                </Button>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Category Navigation */}
        <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex space-x-2 overflow-x-auto scrollbar-hide">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(null)}
                className="whitespace-nowrap"
              >
                All Items
              </Button>
              {allCategories.map((category) => (
                <Button
                  key={category.name}
                  variant={selectedCategory === category.name ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.name)}
                  className="whitespace-nowrap"
                >
                  {category.name}
                  <Badge variant="secondary" className="ml-2">
                    {category.items.length}
                  </Badge>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Menu Content */}
      <div className="container mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedCategory || 'all'}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            {filteredCategories.map((category, categoryIndex) => (
              <div key={category.name}>
                <motion.h2 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: categoryIndex * 0.1 }}
                  className="text-3xl font-bold text-gray-900 mb-6 flex items-center"
                >
                  {category.name}
                  <div className="ml-4 h-px bg-gradient-to-r from-gray-300 to-transparent flex-1"></div>
                </motion.h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {category.items.map((item, itemIndex) => (
                    <motion.div
                      key={`${item.name}-${itemIndex}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: (categoryIndex * 0.1) + (itemIndex * 0.05) }}
                    >
                      <Card className="hover:shadow-lg transition-all duration-300 group">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-3">
                            <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                              {item.name}
                            </h3>
                            <div className="flex items-center space-x-2">
                              <span className="text-2xl font-bold text-green-600">
                                ${item.price}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleFavorite(item.name)}
                                className="p-2"
                              >
                                <Heart 
                                  className={`w-4 h-4 transition-colors ${
                                    favorites.has(item.name) 
                                      ? 'fill-red-500 text-red-500' 
                                      : 'text-gray-400 hover:text-red-500'
                                  }`}
                                />
                              </Button>
                            </div>
                          </div>
                          
                          {item.description && (
                            <p className="text-gray-600 mb-4 leading-relaxed">
                              {item.description}
                            </p>
                          )}
                          
                          {item.dietary_info && item.dietary_info.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {item.dietary_info.map((info, index) => (
                                <Badge 
                                  key={index}
                                  className={getDietaryBadgeColor(info)}
                                  variant="secondary"
                                >
                                  {info}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-xl font-semibold mb-2">{restaurant.name}</h3>
          <p className="text-gray-400 mb-4">Powered by MenuCard</p>
          
          {favorites.size > 0 && (
            <div className="bg-gray-800 rounded-lg p-4 max-w-md mx-auto">
              <h4 className="font-semibold mb-2">Your Favorites ({favorites.size})</h4>
              <div className="text-sm text-gray-300">
                {Array.from(favorites).join(', ')}
              </div>
            </div>
          )}
        </div>
      </footer>
    </div>
  )
}
