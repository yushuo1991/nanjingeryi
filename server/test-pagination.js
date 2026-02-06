/**
 * Test script for optimized GET /api/patients endpoint
 * Tests pagination, search, filtering, and caching
 */

const http = require('http');

const BASE_URL = 'http://localhost:3201';

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    http.get(`${BASE_URL}${path}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const duration = Date.now() - startTime;
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data), duration });
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function runTests() {
  console.log('='.repeat(60));
  console.log('Testing Optimized GET /api/patients Endpoint');
  console.log('='.repeat(60));
  console.log();

  try {
    // Test 1: Basic pagination (default)
    console.log('Test 1: Basic pagination (default - page 1, limit 20)');
    const test1 = await makeRequest('/api/patients');
    console.log(`  Status: ${test1.status}`);
    console.log(`  Duration: ${test1.duration}ms`);
    console.log(`  Items returned: ${test1.data.items?.length || 0}`);
    console.log(`  Total: ${test1.data.pagination?.total || 0}`);
    console.log(`  Total pages: ${test1.data.pagination?.totalPages || 0}`);
    console.log();

    // Test 2: Custom pagination
    console.log('Test 2: Custom pagination (page 1, limit 5)');
    const test2 = await makeRequest('/api/patients?page=1&limit=5');
    console.log(`  Status: ${test2.status}`);
    console.log(`  Duration: ${test2.duration}ms`);
    console.log(`  Items returned: ${test2.data.items?.length || 0}`);
    console.log(`  Page: ${test2.data.pagination?.page}`);
    console.log(`  Limit: ${test2.data.pagination?.limit}`);
    console.log();

    // Test 3: Search by name
    console.log('Test 3: Search by name (search=张)');
    const test3 = await makeRequest('/api/patients?search=张');
    console.log(`  Status: ${test3.status}`);
    console.log(`  Duration: ${test3.duration}ms`);
    console.log(`  Items returned: ${test3.data.items?.length || 0}`);
    console.log(`  Search term: ${test3.data.filters?.search}`);
    console.log();

    // Test 4: Filter by department
    console.log('Test 4: Filter by department (department=康复科)');
    const test4 = await makeRequest('/api/patients?department=康复科');
    console.log(`  Status: ${test4.status}`);
    console.log(`  Duration: ${test4.duration}ms`);
    console.log(`  Items returned: ${test4.data.items?.length || 0}`);
    console.log(`  Department filter: ${test4.data.filters?.department}`);
    console.log();

    // Test 5: Cache hit test (repeat test 1)
    console.log('Test 5: Cache hit test (repeat test 1)');
    const test5 = await makeRequest('/api/patients');
    console.log(`  Status: ${test5.status}`);
    console.log(`  Duration: ${test5.duration}ms (should be faster due to cache)`);
    console.log(`  Items returned: ${test5.data.items?.length || 0}`);
    console.log();

    // Test 6: Cache statistics
    console.log('Test 6: Cache statistics');
    const test6 = await makeRequest('/api/cache/stats');
    console.log(`  Status: ${test6.status}`);
    console.log(`  Cache stats:`, JSON.stringify(test6.data.stats, null, 2));
    console.log();

    // Performance comparison
    console.log('='.repeat(60));
    console.log('Performance Comparison:');
    console.log('='.repeat(60));
    console.log(`  First request (cold cache): ${test1.duration}ms`);
    console.log(`  Second request (warm cache): ${test5.duration}ms`);
    console.log(`  Speed improvement: ${((test1.duration - test5.duration) / test1.duration * 100).toFixed(1)}%`);
    console.log();

    console.log('All tests completed successfully!');
  } catch (error) {
    console.error('Test failed:', error.message);
    process.exit(1);
  }
}

// Run tests
runTests();
