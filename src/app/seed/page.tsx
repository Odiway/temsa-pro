'use client'

import { useState } from 'react'

export default function SeedPage() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const seedDatabase = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/seed?secret=seed-database-123', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({ error: 'Failed to seed database', details: error })
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-center mb-6">Seed Database</h1>
        
        <div className="space-y-4">
          <button
            onClick={seedDatabase}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Seeding...' : 'Seed Database'}
          </button>

          {result && (
            <div className="mt-4 p-4 bg-gray-100 rounded-lg">
              <h3 className="font-semibold mb-2">Result:</h3>
              <pre className="text-sm overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}

          {result?.success && (
            <div className="mt-4 p-4 bg-green-100 border border-green-400 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">Success!</h3>
              <p className="text-green-700">
                Database seeded successfully! You can now log in with:
              </p>
              <ul className="mt-2 text-sm text-green-600">
                <li><strong>Email:</strong> admin@temsafy.com</li>
                <li><strong>Password:</strong> 123456</li>
              </ul>
              <a 
                href="/login" 
                className="inline-block mt-3 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Go to Login
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
