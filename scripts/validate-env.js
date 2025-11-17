// Environment variable validation script
// Run with: node scripts/validate-env.js

const requiredVars = {
  'VITE_SUPABASE_URL': {
    required: true,
    pattern: /^https:\/\/[a-z0-9]+\.supabase\.co$/,
    message: 'Must be a valid Supabase HTTPS URL (e.g., https://xxxxx.supabase.co)'
  },
  'VITE_SUPABASE_ANON_KEY': {
    required: true,
    pattern: /^eyJ[A-Za-z0-9-_=]+\.eyJ[A-Za-z0-9-_=]+\./,
    message: 'Must be a valid JWT token (starts with eyJ)'
  },
  'VITE_PAYSTACK_PUBLIC_KEY': {
    required: false,
    pattern: /^(pk_test_|pk_live_)/,
    message: 'Should start with pk_test_ or pk_live_ (optional for now)'
  },
  'VITE_APP_URL': {
    required: true,
    pattern: /^https?:\/\/.+/,
    message: 'Must be a valid URL'
  },
  'VITE_APP_NAME': {
    required: true,
    pattern: /.+/,
    message: 'Must not be empty'
  }
}

function validateEnv() {
  const errors = []
  const warnings = []
  
  console.log('🔍 Validating environment variables...\n')
  
  for (const [varName, config] of Object.entries(requiredVars)) {
    const value = import.meta.env[varName] || process.env[varName]
    
    if (!value) {
      if (config.required) {
        errors.push(`❌ ${varName}: Missing (required)`)
      } else {
        warnings.push(`⚠️  ${varName}: Missing (optional)`)
      }
    } else if (config.pattern && !config.pattern.test(value)) {
      if (config.required) {
        errors.push(`❌ ${varName}: Invalid format - ${config.message}`)
      } else {
        warnings.push(`⚠️  ${varName}: Invalid format - ${config.message}`)
      }
    } else {
      // Mask sensitive values
      const displayValue = varName.includes('KEY') 
        ? `${value.substring(0, 20)}...` 
        : value
      console.log(`✅ ${varName}: ${displayValue}`)
    }
  }
  
  console.log('')
  
  if (warnings.length > 0) {
    console.log('Warnings:')
    warnings.forEach(w => console.log(`  ${w}`))
    console.log('')
  }
  
  if (errors.length > 0) {
    console.log('Errors:')
    errors.forEach(e => console.log(`  ${e}`))
    console.log('\n❌ Validation failed! Please fix the errors above.')
    process.exit(1)
  } else {
    console.log('✅ All required environment variables are valid!')
    if (warnings.length > 0) {
      console.log('⚠️  Some optional variables are missing or invalid, but that\'s okay for now.')
    }
  }
}

// For Node.js execution
if (typeof process !== 'undefined' && process.env) {
  validateEnv()
}

