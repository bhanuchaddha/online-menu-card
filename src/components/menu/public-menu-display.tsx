'use client'
import { RestaurantData, MenuData } from '@/lib/menu-service'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MapPin, Phone, Globe, Home } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

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

const mutedColors = [
  '7B8A6B', // Sage Green
  'A89B8D', // Taupe
  'C1A999', // Dusty Rose
  'B9A492', // Beige
  '6D7B8D', // Slate Blue
  '9E8B89', // Muted Mauve
  '708D8F', // Steel Blue
  '8D9B87', // Muted Green
];


export function PublicMenuDisplay({ restaurant, menus }: PublicMenuDisplayProps) {
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

  return (
    <div className="min-h-screen bg-white font-sans text-stone-800">
      {/* Header Banner */}
      <header className="relative h-64 md:h-80 w-full">
        <Button asChild className="absolute top-4 left-4 z-10 bg-black/30 hover:bg-black/50 text-white rounded-full h-12 w-12 p-0 transition-colors">
          <Link href="/">
            <Home className="h-6 w-6" />
            <span className="sr-only">Back to Home</span>
          </Link>
        </Button>
        <Image
          src={`/api/placeholder/1600x900/bg=333333&color=ffffff&text=Restaurant`}
          alt={`${restaurant.name} header image`}
          fill
          unoptimized={true}
          className="brightness-50 object-cover"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
          <h1 className="text-5xl md:text-7xl font-bold tracking-widest uppercase">
            {restaurant.name}
          </h1>
          <p className="text-xl md:text-2xl mt-2 tracking-widest">MENU</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-8 md:p-12">
        {/* Restaurant Info */}
        <section className="text-center mb-16">
            {restaurant.description && (
              <p className="mt-4 text-lg text-stone-600 max-w-3xl mx-auto">
                {restaurant.description}
              </p>
            )}
            <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-2 text-stone-600 mt-6">
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
        </section>

        {/* Menu Categories */}
        <div className="space-y-20">
          {allCategories.map((category, index) => (
            <section key={category.name} className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              {/* Text column */}
              <div className={index % 2 === 1 ? 'md:order-2' : ''}>
                <h2 className="text-4xl font-bold mb-8 text-stone-900">{category.name}</h2>
                <ul className="space-y-6">
                  {category.items.map(item => (
                    <li key={item.name}>
                      <div className="flex justify-between items-baseline">
                        <h3 className="text-xl font-semibold text-stone-800">{item.name}</h3>
                        <p className="text-xl font-semibold text-stone-800">${item.price}</p>
                      </div>
                      {item.description && (
                        <p className="text-stone-600 mt-1">{item.description}</p>
                      )}
                       {item.dietary_info && item.dietary_info.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {item.dietary_info.map((info) => (
                            <Badge key={info} variant="outline" className="font-normal">{info}</Badge>
                          ))}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
              {/* Image column */}
              <div className={index % 2 === 1 ? 'md:order-1' : ''}>
                 <Image
                    src={`/api/placeholder/800x600/bg=${mutedColors[index % mutedColors.length]}&color=ffffff&text=Dish`}
                    alt={`${category.name} dishes`}
                    width={800}
                    height={600}
                    unoptimized={true}
                    className="rounded-lg shadow-xl object-cover w-full h-full"
                  />
              </div>
            </section>
          ))}
        </div>
      </main>
       <footer className="text-center mt-12 py-8 bg-stone-100 border-t">
          <p className="text-stone-500">
            Powered by <Link href="/" className="font-semibold hover:text-stone-800">MenuCard</Link>
          </p>
        </footer>
    </div>
  )
}
