import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q') || 'pizza'

  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
  }

  try {
    // Test restaurant search
    const { data: restaurants, error: restaurantError } = await supabaseAdmin
      .from('restaurants')
      .select('*')
      .or(`name.ilike.%${query}%,description.ilike.%${query}%,address.ilike.%${query}%`)
      .limit(3)

    // Test menu search
    const { data: menus, error: menuError } = await supabaseAdmin
      .from('menus')
      .select('*')
      .or(`restaurant_name.ilike.%${query}%`)
      .limit(3)

    return NextResponse.json({
      query,
      results: {
        restaurants: restaurants || [],
        menus: menus || [],
        restaurant_count: restaurants?.length || 0,
        menu_count: menus?.length || 0
      },
      errors: {
        restaurant_error: restaurantError?.message,
        menu_error: menuError?.message
      }
    })

  } catch (error) {
    console.error('Search test error:', error)
    return NextResponse.json(
      { error: 'Search test failed', details: error },
      { status: 500 }
    )
  }
}

export async function POST() {
  return NextResponse.json({
    message: 'Text Search Test Endpoint',
    usage: 'GET /api/search/test?q=pizza'
  })
}
