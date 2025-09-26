'use client'

import { useState } from 'react'

export default function TestLoginPage() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testAPI = async () => {
    setLoading(true)
    setResult(null)

    try {
      console.log('Testing API...')
      
      // Test 1: Basic API
      const testResponse = await fetch('/api/test')
      const testData = await testResponse.json()
      console.log('Test API result:', testData)

      // Test 2: DB API
      const dbResponse = await fetch('/api/debug/db')
      const dbData = await dbResponse.json()
      console.log('DB API result:', dbData)

      // Test 3: Login API
      const loginResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'test123',
        }),
      })
      const loginData = await loginResponse.json()
      console.log('Login API result:', loginData)

      setResult({
        test: testData,
        db: dbData,
        login: loginData
      })

    } catch (error) {
      console.error('Test error:', error)
      setResult({ error: String(error) })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">API Test Page</h1>
      
      <button
        onClick={testAPI}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Test APIs'}
      </button>

      {result && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Results:</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
