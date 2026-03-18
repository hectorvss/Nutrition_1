async function testAPI() {
  try {
    // This runs completely unauthenticated because we disabled the RLS and manager check for testing
    // Or at least we can just try to see what it spits out
    const response = await fetch('http://localhost:3005/api/manager/clients', {
      headers: {
        // Need a token to bypass verifyManager middleware
        'Authorization': `Bearer fake_token_wont_work_need_real`
      }
    });

    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(err);
  }
}

testAPI();
