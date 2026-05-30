/**
 * Test script for export functionality
 * Run with: node test-export.js
 */

const http = require('http');

// Test configuration
const BASE_URL = 'http://localhost:5000';
const ENDPOINTS = [
  { path: '/api/projects', name: 'Projects' },
  { path: '/api/bills', name: 'Bills' },
  { path: '/api/expenses', name: 'Expenses' },
  { path: '/api/payments', name: 'Payments' },
  { path: '/api/leads', name: 'Leads' },
  { path: '/api/users', name: 'Users' },
  { path: '/api/vendors', name: 'Vendors' },
  { path: '/api/products', name: 'Products' },
  { path: '/api/blogs', name: 'Blogs' },
  { path: '/api/worker-rates', name: 'Worker Rates' },
];

/**
 * Test endpoint with export format
 */
async function testEndpoint(endpoint, format) {
  return new Promise((resolve) => {
    const url = `${BASE_URL}${endpoint}?format=${format}`;
    const startTime = Date.now();

    http.get(url, (res) => {
      let data = '';
      
      res.on('data', chunk => {
        data += chunk;
      });
      
      res.on('end', () => {
        const duration = Date.now() - startTime;
        const size = data.length;
        const success = res.statusCode === 200;
        
        resolve({
          endpoint,
          format,
          statusCode: res.statusCode,
          contentType: res.headers['content-type'],
          size,
          duration,
          success,
          preview: data.substring(0, 100).replace(/\n/g, ' ')
        });
      });
    }).on('error', (err) => {
      resolve({
        endpoint,
        format,
        error: err.message,
        success: false
      });
    });
  });
}

/**
 * Run all tests
 */
async function runTests() {
  console.log('🧪 Testing Export Functionality\n');
  console.log('='.repeat(80));
  
  let passed = 0;
  let failed = 0;
  
  for (const endpoint of ENDPOINTS) {
    console.log(`\n📋 Testing: ${endpoint.name}`);
    console.log('-'.repeat(40));
    
    // Test CSV export
    const csvResult = await testEndpoint(endpoint.path, 'csv');
    const csvStatus = csvResult.success ? '✅' : '❌';
    console.log(`${csvStatus} CSV Export:`);
    if (csvResult.success) {
      console.log(`   Status: ${csvResult.statusCode}`);
      console.log(`   Size: ${(csvResult.size / 1024).toFixed(2)} KB`);
      console.log(`   Time: ${csvResult.duration}ms`);
      console.log(`   Preview: ${csvResult.preview}...`);
      passed++;
    } else {
      console.log(`   Error: ${csvResult.error || 'Unknown error'}`);
      failed++;
    }
    
    // Test JSON export
    const jsonResult = await testEndpoint(endpoint.path, 'json');
    const jsonStatus = jsonResult.success ? '✅' : '❌';
    console.log(`${jsonStatus} JSON Export:`);
    if (jsonResult.success) {
      console.log(`   Status: ${jsonResult.statusCode}`);
      console.log(`   Size: ${(jsonResult.size / 1024).toFixed(2)} KB`);
      console.log(`   Time: ${jsonResult.duration}ms`);
      console.log(`   Preview: ${jsonResult.preview}...`);
      passed++;
    } else {
      console.log(`   Error: ${jsonResult.error || 'Unknown error'}`);
      failed++;
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('\n📊 Test Summary:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Total: ${passed + failed}`);
  console.log(`🎯 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed!');
  } else {
    console.log(`\n⚠️  ${failed} test(s) failed. Please check the errors above.`);
  }
}

// Run tests
runTests();
