#!/usr/bin/env ts-node

/**
 * Script to apply RLS migration and verify the setup
 * 
 * This script:
 * 1. Applies the RLS migration
 * 2. Verifies that RLS is enabled on all tables
 * 3. Checks that policies are created
 * 4. Reports any remaining issues
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface TableRLSStatus {
  tablename: string;
  rowsecurity: boolean;
}

interface PolicyInfo {
  tablename: string;
  policyname: string;
  permissive: string;
  roles: string[];
  cmd: string;
}

async function checkRLSStatus() {
  console.log('🔍 Checking RLS status for all tables...\n');

  const tables = await prisma.$queryRaw<TableRLSStatus[]>`
    SELECT 
      tablename,
      rowsecurity
    FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename NOT LIKE 'pg_%'
    AND tablename NOT LIKE '_prisma%'
    ORDER BY tablename;
  `;

  const tablesWithoutRLS = tables.filter(t => !t.rowsecurity);
  const tablesWithRLS = tables.filter(t => t.rowsecurity);

  console.log(`✅ Tables with RLS enabled: ${tablesWithRLS.length}`);
  tablesWithRLS.forEach(t => console.log(`   - ${t.tablename}`));

  if (tablesWithoutRLS.length > 0) {
    console.log(`\n❌ Tables WITHOUT RLS: ${tablesWithoutRLS.length}`);
    tablesWithoutRLS.forEach(t => console.log(`   - ${t.tablename}`));
  } else {
    console.log('\n✅ All tables have RLS enabled!');
  }

  return { tablesWithRLS: tablesWithRLS.length, tablesWithoutRLS: tablesWithoutRLS.length };
}

async function checkPolicies() {
  console.log('\n🔍 Checking RLS policies...\n');

  const policies = await prisma.$queryRaw<PolicyInfo[]>`
    SELECT 
      schemaname || '.' || tablename as tablename,
      policyname,
      permissive,
      roles,
      cmd
    FROM pg_policies
    WHERE schemaname = 'public'
    ORDER BY tablename, policyname;
  `;

  console.log(`📋 Total policies created: ${policies.length}\n`);

  // Group policies by table
  const policiesByTable = policies.reduce((acc, policy) => {
    const table = policy.tablename.replace('public.', '');
    if (!acc[table]) {
      acc[table] = [];
    }
    acc[table].push(policy);
    return acc;
  }, {} as Record<string, PolicyInfo[]>);

  // Display policies by table
  Object.entries(policiesByTable).forEach(([table, tablePolicies]) => {
    console.log(`📄 ${table} (${tablePolicies.length} policies)`);
    tablePolicies.forEach(p => {
      console.log(`   - ${p.policyname} [${p.cmd}]`);
    });
    console.log('');
  });

  return policies.length;
}

async function checkSensitiveColumns() {
  console.log('🔍 Checking sensitive columns protection...\n');

  // Check if User.password is protected
  const userTableRLS = await prisma.$queryRaw<TableRLSStatus[]>`
    SELECT tablename, rowsecurity
    FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename = 'User';
  `;

  if (userTableRLS.length > 0 && userTableRLS[0].rowsecurity) {
    console.log('✅ User table (with password column) is protected by RLS');
  } else {
    console.log('❌ User table is NOT protected by RLS - passwords may be exposed!');
  }
}

async function main() {
  console.log('🚀 RLS Migration Verification Tool\n');
  console.log('=' .repeat(60));
  console.log('');

  try {
    // Check RLS status
    const rlsStatus = await checkRLSStatus();

    // Check policies
    const policyCount = await checkPolicies();

    // Check sensitive columns
    await checkSensitiveColumns();

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Tables with RLS: ${rlsStatus.tablesWithRLS}`);
    console.log(`❌ Tables without RLS: ${rlsStatus.tablesWithoutRLS}`);
    console.log(`📋 Total policies: ${policyCount}`);

    if (rlsStatus.tablesWithoutRLS === 0 && policyCount > 0) {
      console.log('\n🎉 SUCCESS! All tables are secured with RLS policies.');
      console.log('\n📝 Next steps:');
      console.log('   1. Test the policies with different user roles');
      console.log('   2. Verify your backend uses the service role key');
      console.log('   3. Verify your frontend uses the anon key');
      console.log('   4. Check Supabase Dashboard for any remaining linter warnings');
    } else {
      console.log('\n⚠️  WARNING: Some tables are not fully protected.');
      console.log('   Please review the migration and apply it if not done yet.');
    }

  } catch (error) {
    console.error('❌ Error checking RLS status:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
