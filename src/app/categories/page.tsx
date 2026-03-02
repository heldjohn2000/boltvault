import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Category } from '@/lib/types'

export const revalidate = 3600

async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  if (error) {
    console.error('Error fetching categories:', error)
    return []
  }

  return data || []
}

const categoryIcons: Record<string, string> = {
  spacers: '⬤',
  fasteners: '🔩',
  washers: '⭕',
  nuts: '⬛',
  bolts: '↳',
  screws: '🔧',
  anchors: '⚓',
  rivets: '📌',
  hinges: '🔀',
  clips: '📎',
}

export default async function CategoriesPage() {
  const categories = await getCategories()

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-semibold text-gray-900 mb-4">All Categories</h1>
        <p className="text-gray-500 mb-12">
          Browse our complete selection of industrial fasteners by category.
        </p>

        <div className="grid-categories">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="card hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="text-6xl mb-4">
                {categoryIcons[category.slug] || '🔩'}
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-3">
                {category.name}
              </h2>
              <p className="text-gray-500">{category.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
