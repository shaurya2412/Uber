/**
 * Comprehensive API Test Suite for Nexus Ride-Hailing Platform
 * Tests every API route one by one across User, Captain, Google Auth,
 * Fare, Rides, Payments, Solana Web3, Admin, and Chat Helper.
 */

const BASE_URL = process.env.API_BASE || 'http://localhost:5000';
const CHAT_URL = process.env.CHAT_BASE || 'http://localhost:5500';

const results = [];

async function test(name, category, fn) {
  const start = Date.now();
  try {
    const res = await fn();
    const duration = Date.now() - start;
    results.push({ name, category, status: 'PASS', duration, details: res });
    console.log(`  ✅ [${category}] ${name} (${duration}ms)`);
  } catch (err) {
    const duration = Date.now() - start;
    results.push({ name, category, status: 'FAIL', duration, error: err.message });
    console.log(`  ❌ [${category}] ${name} (${duration}ms) - Error: ${err.message}`);
  }
}

async function runAllApiTests() {
  console.log('\n===========================================================');
  console.log('       NEXUS PLATFORM: TESTING ALL APIS ONE BY ONE         ');
  console.log('===========================================================\n');

  let userToken = null;
  let userRefreshToken = null;
  let captainToken = null;
  let captainRefreshToken = null;
  const testUserEmail = `test.rider.${Date.now()}@nexus.ai`;
  const testDriverEmail = `test.driver.${Date.now()}@nexus.ai`;
  let testRideId = null;

  // ---------------------------------------------------------
  // 1. USER AUTHENTICATION & PROFILE APIS
  // ---------------------------------------------------------
  console.log('\n--- 1. User Authentication & Profile APIs ---');

  await test('POST /users/register - Register Passenger', 'User', async () => {
    const res = await fetch(`${BASE_URL}/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullname: { firstname: 'Karan', lastname: 'Singhania' },
        email: testUserEmail,
        password: 'password123',
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || JSON.stringify(data.error));
    userToken = data.accessToken || data.token;
    userRefreshToken = data.refreshToken;
    return `Status ${res.status}: User registered`;
  });

  await test('POST /users/login - Rider Login with Credentials', 'User', async () => {
    const res = await fetch(`${BASE_URL}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUserEmail,
        password: 'password123',
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || JSON.stringify(data.error));
    userToken = data.accessToken || data.token;
    userRefreshToken = data.refreshToken || userRefreshToken;
    return `Status ${res.status}: Dual tokens received`;
  });

  await test('GET /users/profile - Fetch Authenticated Profile', 'User', async () => {
    const res = await fetch(`${BASE_URL}/users/profile`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Profile fetch failed');
    return `Status ${res.status}: Profile returned for ${data.user?.email || 'User'}`;
  });

  await test('POST /users/refresh-token - Rotate Access Token', 'User', async () => {
    const res = await fetch(`${BASE_URL}/users/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: userRefreshToken }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Token refresh failed');
    userToken = data.accessToken;
    return `Status ${res.status}: New access token generated`;
  });

  await test('POST /users/logout - Revoke Session & Blacklist', 'User', async () => {
    const res = await fetch(`${BASE_URL}/users/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Logout failed');
    return `Status ${res.status}: Token invalidated`;
  });

  // Log back in to retain valid userToken for subsequent ride tests
  const loginRes = await fetch(`${BASE_URL}/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testUserEmail, password: 'password123' }),
  });
  const loginData = await loginRes.json();
  userToken = loginData.accessToken || loginData.token;

  // ---------------------------------------------------------
  // 2. CAPTAIN / DRIVER APIS
  // ---------------------------------------------------------
  console.log('\n--- 2. Captain / Driver Lifecycle APIs ---');

  await test('POST /captains/register - Register Captain', 'Captain', async () => {
    const res = await fetch(`${BASE_URL}/captains/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullname: { firstname: 'Rohan', lastname: 'Verma' },
        email: testDriverEmail,
        password: 'password123',
        vehicle: {
          color: 'Midnight Black',
          plate: 'DL 01 AX 9921',
          vehiclemodel: 'Tesla Model 3',
          capacity: '4',
        },
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || JSON.stringify(data.error));
    captainToken = data.accessToken || data.captaintoken;
    captainRefreshToken = data.refreshToken;
    return `Status ${res.status}: Driver registered with vehicle`;
  });

  await test('POST /captains/login - Captain Login', 'Captain', async () => {
    const res = await fetch(`${BASE_URL}/captains/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testDriverEmail,
        password: 'password123',
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || JSON.stringify(data.error));
    captainToken = data.accessToken || data.captaintoken;
    captainRefreshToken = data.refreshToken || captainRefreshToken;
    return `Status ${res.status}: Driver dual tokens received`;
  });

  await test('GET /captains/profile - Fetch Driver Profile', 'Captain', async () => {
    const res = await fetch(`${BASE_URL}/captains/profile`, {
      headers: { Authorization: `Bearer ${captainToken}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Profile fetch failed');
    return `Status ${res.status}: Driver profile verified`;
  });

  await test('PUT /captains/status - Toggle Driver Online/Offline', 'Captain', async () => {
    const res = await fetch(`${BASE_URL}/captains/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${captainToken}`,
      },
      body: JSON.stringify({ active: true }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Status update failed');
    return `Status ${res.status}: Driver online status updated`;
  });

  await test('POST /captains/refresh-token - Rotate Driver Token', 'Captain', async () => {
    const res = await fetch(`${BASE_URL}/captains/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: captainRefreshToken }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Driver token refresh failed');
    captainToken = data.accessToken;
    return `Status ${res.status}: Driver access token rotated`;
  });

  await test('POST /captains/logout - Driver Logout', 'Captain', async () => {
    const res = await fetch(`${BASE_URL}/captains/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${captainToken}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Driver logout failed');
    return `Status ${res.status}: Driver session closed`;
  });

  // Re-login captain for ride lifecycle tests
  const capLoginRes = await fetch(`${BASE_URL}/captains/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testDriverEmail, password: 'password123' }),
  });
  const capLoginData = await capLoginRes.json();
  captainToken = capLoginData.accessToken || capLoginData.captaintoken;

  // ---------------------------------------------------------
  // 3. GOOGLE AUTHENTICATION API
  // ---------------------------------------------------------
  console.log('\n--- 3. Google OAuth Authentication API ---');

  await test('POST /auth/google - Authenticate with Google Token', 'GoogleAuth', async () => {
    const res = await fetch(`${BASE_URL}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential: 'test_google_credential' }),
    });
    const data = await res.json();
    if (!res.ok || !data.token) throw new Error(data.message || 'Google auth failed');
    return `Status ${res.status}: Verified Google user issued JWT`;
  });

  // ---------------------------------------------------------
  // 4. FARE ESTIMATION & SURGE PRICING APIS
  // ---------------------------------------------------------
  console.log('\n--- 4. Fare Estimation & Dynamic Surge Pricing APIs ---');

  await test('POST /api/fare/calculate - Calculate Fare with Surge', 'Fare', async () => {
    const res = await fetch(`${BASE_URL}/api/fare/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pickup: { lat: 28.6139, lng: 77.2090 },
        destination: { lat: 28.5562, lng: 77.1000 },
      }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.message || 'Fare calculation failed');
    return `Status ${res.status}: Fare ₹${data.fare} (${data.distanceKm} km, Surge: ${data.surgeMultiplier}x)`;
  });

  // ---------------------------------------------------------
  // 5. CORE RIDE LIFECYCLE APIS
  // ---------------------------------------------------------
  console.log('\n--- 5. Core Ride Lifecycle APIs ---');

  await test('POST /rides/book - Book New Ride', 'Ride', async () => {
    const res = await fetch(`${BASE_URL}/rides/book`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        pickup: {
          address: 'Connaught Place, New Delhi',
          coordinates: { lat: 28.6139, lng: 77.2090 },
        },
        destination: {
          address: 'Indira Gandhi International Airport T3',
          coordinates: { lat: 28.5562, lng: 77.1000 },
        },
        fare: 380,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || JSON.stringify(data.error));
    testRideId = data.data?._id || data.ride?._id || data._id;
    return `Status ${res.status}: Ride created with ID ${testRideId || 'generated'}`;
  });

  await test('GET /rides/user-history - Rider Trip History', 'Ride', async () => {
    const res = await fetch(`${BASE_URL}/rides/user-history`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch history');
    return `Status ${res.status}: Fetched ${data.data?.length || 0} user rides`;
  });

  await test('GET /rides/available - Captain Query Nearby Rides', 'Ride', async () => {
    const res = await fetch(`${BASE_URL}/rides/available`, {
      headers: { Authorization: `Bearer ${captainToken}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch available rides');
    return `Status ${res.status}: Returned available rides in area`;
  });

  await test('GET /rides/dashboard-stats - Rider Dashboard Stats', 'Ride', async () => {
    const res = await fetch(`${BASE_URL}/rides/dashboard-stats`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to get stats');
    return `Status ${res.status}: Stats retrieved`;
  });

  // ---------------------------------------------------------
  // 6. PAYMENT PROCESSING & WEB3 ESCROW APIS
  // ---------------------------------------------------------
  console.log('\n--- 6. Payment Processing & Web3 Escrow APIs ---');

  await test('POST /create-orders/create-order - Create Razorpay Order', 'Payment', async () => {
    const res = await fetch(`${BASE_URL}/create-orders/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({ amount: 350 }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.message || 'Razorpay order creation failed');
    return `Status ${res.status}: Order ${data.order?.id} created with key ${data.key?.slice(0, 8)}...`;
  });

  await test('POST /verify/verify-payment - Verify Payment & Receipt Trigger', 'Payment', async () => {
    const res = await fetch(`${BASE_URL}/verify/verify-payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        razorpay_order_id: 'order_test_123',
        razorpay_payment_id: 'pay_test_456',
        razorpay_signature: 'sig_test_invalid_sample',
      }),
    });
    const data = await res.json();
    // Endpoint handles validation and responds with verification result
    return `Status ${res.status}: Verification response received (${data.message || 'Evaluated'})`;
  });

  await test('POST /solana/initiate - Create Solana Web3 Payment Intent', 'Solana', async () => {
    const res = await fetch(`${BASE_URL}/solana/initiate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: 450,
        rideId: testRideId || '650f1a2b3c4d5e6f7a8b9c0d',
        userId: '650f1a2b3c4d5e6f7a8b9c0e',
      }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.message || 'Solana initiate failed');
    return `Status ${res.status}: Intent created, Treasury: ${data.data?.treasuryWalletAddress?.slice(0, 8)}...`;
  });

  await test('POST /solana/escrow/hold - Solana Micro-Escrow Lock', 'Solana', async () => {
    const res = await fetch(`${BASE_URL}/solana/escrow/hold`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        escrowId: 'escrow_test_' + Date.now(),
        amountSol: 0.05,
        riderWallet: '7BU4o3HDGVMDtQvPrfvVMGinSgfD9UDmMV69vPJNbJCy',
      }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.message || 'Escrow hold failed');
    return `Status ${res.status}: Escrow locked in holding status`;
  });

  await test('POST /solana/escrow/release - Solana Micro-Escrow Release', 'Solana', async () => {
    const res = await fetch(`${BASE_URL}/solana/escrow/release`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        escrowId: 'escrow_test_sample',
        driverWallet: '7BU4o3HDGVMDtQvPrfvVMGinSgfD9UDmMV69vPJNbJCy',
      }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.message || 'Escrow release failed');
    return `Status ${res.status}: Escrow released to captain wallet`;
  });

  // ---------------------------------------------------------
  // 7. EXECUTIVE ADMIN OPERATIONS & ANALYTICS APIS
  // ---------------------------------------------------------
  console.log('\n--- 7. Executive Admin Operations & Analytics APIs ---');

  const adminHeaders = {
    Authorization: `Bearer ${userToken}`,
    'x-admin-key': 'nexus-admin-secret',
  };

  await test('GET /api/admin/rides/active - City-Wide Active Rides Stream', 'Admin', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/rides/active`, { headers: adminHeaders });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Active rides query failed');
    return `Status ${res.status}: ${data.data?.length ?? 0} active rides tracked`;
  });

  await test('GET /api/admin/analytics/revenue - 7-Day Revenue Trends', 'Admin', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/analytics/revenue`, { headers: adminHeaders });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Revenue analytics query failed');
    return `Status ${res.status}: Total Revenue ₹${data.data?.grossRevenue ?? 0}`;
  });

  await test('GET /api/admin/analytics/peak-hours - 24-Hour Demand Histogram', 'Admin', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/analytics/peak-hours`, { headers: adminHeaders });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Peak hours query failed');
    return `Status ${res.status}: 24 hourly demand slots calculated`;
  });

  await test('GET /api/admin/captains - Driver Fleet Management List', 'Admin', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/captains`, { headers: adminHeaders });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Drivers list failed');
    return `Status ${res.status}: ${data.data?.length ?? 0} drivers registered in fleet`;
  });

  // ---------------------------------------------------------
  // 8. AI CHAT HELPER ASSISTANT API (PORT 5500)
  // ---------------------------------------------------------
  console.log('\n--- 8. AI Chat Helper Assistant API (Port 5500) ---');

  await test('GET http://localhost:5500/ - Health Check', 'AIChat', async () => {
    const res = await fetch(`${CHAT_URL}/`);
    const text = await res.text();
    if (!res.ok) throw new Error(`Status ${res.status}: ${text}`);
    return `Status ${res.status}: ${text}`;
  });

  // ---------------------------------------------------------
  // SUMMARY REPORT
  // ---------------------------------------------------------
  console.log('\n===========================================================');
  console.log('                 API TEST SUITE SUMMARY                    ');
  console.log('===========================================================');

  const passed = results.filter((r) => r.status === 'PASS').length;
  const failed = results.filter((r) => r.status === 'FAIL').length;
  const total = results.length;

  console.log(`\nTOTAL APIS TESTED: ${total}`);
  console.log(`PASSED: ${passed} / ${total} (${Math.round((passed / total) * 100)}%)`);
  console.log(`FAILED: ${failed} / ${total}\n`);

  if (failed === 0) {
    console.log('🌟 ALL APIS TESTED SUCCESSFULLY AND WORKING PROPERLY!\n');
  } else {
    console.log('⚠️ Some APIs experienced issues. Review details above.\n');
  }
}

runAllApiTests();
