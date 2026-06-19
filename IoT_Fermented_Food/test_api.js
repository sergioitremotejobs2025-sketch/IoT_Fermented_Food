const axios = require('axios');
async function test() {
  try {
    const resAuth = await axios.post('http://127.0.0.1:31600/api/login', { username: 'testuser', password: 'testpassword123' });
    console.log("Token:", resAuth.data.accessToken);
    const resPics = await axios.get('http://127.0.0.1:31600/api/pictures', {
      headers: { Authorization: `Bearer ${resAuth.data.accessToken}` }
    });
    console.log("Pictures:", JSON.stringify(resPics.data, null, 2));
  } catch (err) {
    console.error("Error:", err.response ? err.response.data : err.message);
  }
}
test();
