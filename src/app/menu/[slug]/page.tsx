import { notFound } from 'next/navigation'
import { menuService } from '@/lib/menu-service'
import { PublicMenuDisplay } from '@/components/menu/public-menu-display'

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function PublicMenuPage({ params }: PageProps) {
  const { slug } = await params

  // Get restaurant and all its menus
  const { restaurant, menus } = await menuService.getPublicRestaurantWithMenus(slug)
  
  if (!restaurant) {
    notFound()
  }

  return (
    <PublicMenuDisplay 
      restaurant={restaurant}
      menus={menus}
    />
  )
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const { restaurant } = await menuService.getPublicRestaurantWithMenus(slug)

  if (!restaurant) {
    return {
      title: 'Menu Not Found',
      description: 'The requested menu could not be found.'
    }
  }

  return {
    title: `${restaurant.name} - Digital Menu`,
    description: restaurant.description || `View the digital menu for ${restaurant.name}. Order online with ease.`,
    keywords: `${restaurant.name}, menu, restaurant, food, order online`,
    openGraph: {
      title: `${restaurant.name} - Digital Menu`,
      description: restaurant.description || `View the digital menu for ${restaurant.name}`,
      type: 'website',
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${restaurant.name} - Digital Menu`,
      description: restaurant.description || `View the digital menu for ${restaurant.name}`,
    },
    alternates: {
      canonical: `/menu/${slug}`,
    },
  }
}
