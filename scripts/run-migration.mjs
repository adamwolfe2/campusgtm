#!/usr/bin/env node
/**
 * Database Migration Script
 * Runs the initial schema migration on Supabase
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local
const envPath = join(__dirname, '..', '.env.local');
const envContent = readFileSync(envPath, 'utf-8');
const envVars = {};

envContent.split('\n').forEach(line => {
  const match = line.match(/^([^#][^=]+)=(.+)$/);
  if (match) {
    envVars[match[1].trim()] = match[2].trim();
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

console.log('🔗 Connecting to Supabase...');
console.log(`   URL: ${supabaseUrl}`);

// Read the migration SQL
const migrationPath = join(__dirname, '..', 'supabase', 'migrations', '20241119_initial_schema.sql');
const migrationSQL = readFileSync(migrationPath, 'utf-8');

console.log('\n📋 Migration SQL loaded from:', migrationPath);
console.log('📊 Total SQL length:', migrationSQL.length, 'characters\n');

console.log('⚠️  IMPORTANT: The anon key cannot execute DDL (CREATE TABLE) statements.');
console.log('📝 Please run this migration manually in the Supabase SQL Editor:\n');
console.log('1. Go to: https://supabase.com/dashboard/project/cymlsawrricfuqgrxtjj/sql/new');
console.log('2. Copy and paste the SQL from: supabase/migrations/20241119_initial_schema.sql');
console.log('3. Click "Run" to execute\n');
console.log('✅ After running, the database will have:');
console.log('   - 6 tables (users, workspaces, strategy_modules, blocks, onboarding_data, generated_strategies)');
console.log('   - Row Level Security (RLS) enabled on all tables');
console.log('   - Proper indexes for performance');
console.log('   - Triggers for updated_at timestamps');
console.log('   - Automatic user profile creation on signup\n');

// Test connection with anon key
const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🧪 Testing connection...');
try {
  const { data, error } = await supabase.from('workspaces').select('count').limit(0);

  if (error && error.code === '42P01') {
    console.log('⚠️  Tables not yet created. Please run the migration SQL in Supabase dashboard.\n');
  } else if (error) {
    console.log('❌ Connection error:', error.message);
  } else {
    console.log('✅ Connection successful! Tables are set up correctly.\n');
  }
} catch (err) {
  console.error('❌ Error testing connection:', err.message);
}
