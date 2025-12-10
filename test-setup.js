#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

console.log('🔍 Financial Screener Setup Test\n')

// Check if required files exist
const requiredFiles = [
  '.env',
  '.env.local',
  'src/lib/supabase.ts',
  'src/lib/config.ts',
  'src/lib/env.ts'
]

console.log('📁 Checking required files...')
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`)
  } else {
    console.log(`❌ ${file} - MISSING`)
  }
})

// Load environment variables
require('dotenv').config({ path: '.env.local' })
require('dotenv').config({ path: '.env' })

console.log('\n🔧 Environment Variables:')
const envVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY', 
  'SUPABASE_SERVICE_ROLE_KEY',
  'FMP_API_KEY',
  'REDIS_URL'
]

envVars.forEach(envVar => {
  const value = process.env[envVar]
  if (value) {
    console.log(`✅ ${envVar}: ${envVar.includes('KEY') ? '***' : value.substring(0, 20)}...`)
  } else {
    console.log(`❌ ${envVar}: NOT SET`)
  }
})

// Test Supabase client creation
console.log('\n🔌 Testing Supabase Connection...')
try {
  // Set up TypeScript compilation for testing
  require('ts-node').register({
    compilerOptions: {
      module: 'commonjs',
      target: 'es2017',
      moduleResolution: 'node',
      esModuleInterop: true,
      allowSyntheticDefaultImports: true,
      skipLibCheck: true
    }
  })
  
  const { getSupabase } = require('./src/lib/supabase.ts')
  const client = getSupabase()
  console.log('✅ Supabase client created successfully')
  
  // Test a simple query
  client.from('user_profiles').select('count').limit(1).then(result => {
    if (result.error) {
      console.log('⚠️  Database connection test failed:', result.error.message)
    } else {
      console.log('✅ Database connection test passed')
    }
  }).catch(err => {
    console.log('⚠️  Database connection test error:', err.message)
  })
  
} catch (error) {
  console.log('❌ Failed to create Supabase client:', error.message)
}

console.log('\n🐳 Docker Setup:')
if (fs.existsSync('docker-compose.yml')) {
  console.log('✅ docker-compose.yml')
} else {
  console.log('❌ docker-compose.yml - MISSING')
}

if (fs.existsSync('docker-compose.dev.yml')) {
  console.log('✅ docker-compose.dev.yml')
} else {
  console.log('❌ docker-compose.dev.yml - MISSING')
}

if (fs.existsSync('Dockerfile')) {
  console.log('✅ Dockerfile')
} else {
  console.log('❌ Dockerfile - MISSING')
}

console.log('\n🚀 Ready to start!')
console.log('Run one of these commands:')
console.log('  npm run docker:dev    # Start with Docker (development)')
console.log('  npm run docker:prod   # Start with Docker (production)')
console.log('  npm run dev           # Start locally (requires Redis)')