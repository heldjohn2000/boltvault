import { supabase } from '@/lib/supabase'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    const category = searchParams.get('category')
    const material = searchParams.get('material')
    const search = searchParams.get('search')
    const thread = searchParams.get('thread')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    let query = supabase
      .from('products')
      .select('*', { count: 'exact' })

    if (search) {
      query = query.or(
        `part_number.ilike.%${search}%,description.ilike.%${search}%`
      )
    }

    if (material) {
      query = query.eq('material', material)
    }

    if (thread) {
      query = query.eq('thread_spec', thread)
    }

    if (category) {
      query = query.in(
        'family_id',
        (
          await supabase
            .from('product_families')
            .select('id')
            .eq('category_id', category)
        ).data?.map((f: any) => f.id) || []
      )
    }

    const offset = (page - 1) * limit
    const { data, count, error } = await query
      .range(offset, offset + limit - 1)
      .order('part_number')

    if (error) {
      return Response.json({ error: error.message }, { status: 500 })
    }

    return Response.json({
      products: data || [],
      pagination: {
        total: count || 0,
        page,
        limit,
        pages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
