'use client'

import { useSession, signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Camera, Smartphone, Zap, Globe, ArrowRight, Menu } from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  const { data: session, status } = useSession()

  const features = [
    {
      icon: Camera,
      title: 'AI Menu Extraction',
      description: 'Simply take a photo of your menu and our AI will extract all items, prices, and descriptions automatically.'
    },
    {
      icon: Smartphone,
      title: 'Mobile-First Design',
      description: 'Beautiful, responsive menus that work perfectly on all devices with PWA support for app-like experience.'
    },
    {
      icon: Zap,
      title: 'Instant Updates',
      description: 'Update prices and availability in real-time. Changes are reflected immediately on your public menu.'
    },
    {
      icon: Globe,
      title: 'Public URLs',
      description: 'Get a unique URL for your restaurant that you can share anywhere - QR codes, social media, websites.'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Menu className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">MenuCard</span>
          </div>
          
          <div className="flex items-center space-x-4">
            {status === 'loading' ? (
              <div className="h-9 w-20 bg-gray-200 animate-pulse rounded-md" />
            ) : session ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600">Welcome, {session.user?.name}</span>
                <Button asChild>
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
              </div>
            ) : (
              <Button onClick={() => signIn('google')} className="bg-blue-600 hover:bg-blue-700">
                Sign In with Google
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Transform Your Menu with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              AI Magic
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Take a photo of your restaurant menu and get a beautiful, professional digital menu in minutes. 
            No design skills needed, no coding required.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            {session ? (
              <Button size="lg" asChild className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-3">
                <Link href="/dashboard">
                  Go to Dashboard <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            ) : (
              <Button 
                size="lg" 
                onClick={() => signIn('google')}
                className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-3"
              >
                Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            )}
            <Button size="lg" variant="outline" className="text-lg px-8 py-3">
              View Demo
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
            {[
              { number: '95%', label: 'Accuracy Rate' },
              { number: '< 2min', label: 'Setup Time' },
              { number: '100%', label: 'Free to Start' }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-blue-600">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Go Digital
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our platform provides all the tools you need to create, manage, and share beautiful digital menus.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardHeader className="text-center pb-4">
                    <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                      <Icon className="h-8 w-8 text-blue-600" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-center text-gray-600 leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Get your digital menu ready in three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Take a Photo',
                description: 'Use your phone camera to capture your existing menu'
              },
              {
                step: '2',
                title: 'AI Extraction',
                description: 'Our AI reads and organizes all your menu items automatically'
              },
              {
                step: '3',
                title: 'Publish & Share',
                description: 'Choose a theme and share your beautiful digital menu'
              }
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-blue-600">
        <div className="container mx-auto text-center max-w-3xl">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Transform Your Menu?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join hundreds of restaurants already using MenuCard to create beautiful digital menus.
          </p>
          
          {session ? (
            <Button size="lg" variant="secondary" asChild className="text-lg px-8 py-3">
              <Link href="/dashboard">
                Go to Dashboard <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          ) : (
            <Button 
              size="lg" 
              variant="secondary" 
              onClick={() => signIn('google')}
              className="text-lg px-8 py-3"
            >
              Start for Free <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-gray-900 text-white">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Menu className="h-6 w-6" />
                <span className="text-xl font-bold">MenuCard</span>
              </div>
              <p className="text-gray-400">
                AI-powered digital menus for modern restaurants.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Features</li>
                <li>Pricing</li>
                <li>Demo</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Help Center</li>
                <li>Contact</li>
                <li>API Docs</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li>About</li>
                <li>Blog</li>
                <li>Privacy</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 MenuCard. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}