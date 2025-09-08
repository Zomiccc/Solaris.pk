/* eslint-disable no-console */
const baseUrl = process.env.BASE || 'http://localhost:5000';

async function fetchJson(path, options) {
  const res = await fetch(baseUrl + path, options);
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch (_) {
    json = { raw: text };
  }
  return { ok: res.ok, status: res.status, json };
}

async function fetchStatus(path, options) {
  const res = await fetch(baseUrl + path, options);
  return { ok: res.ok, status: res.status };
}

(async () => {
  try {
    const health = await fetchJson('/health');
    console.log('HEALTH', health.status, health.json);

    const products = await fetchStatus('/api/products');
    console.log('PRODUCTS', products.status);

    const login = await fetchJson('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'zahra00', password: 'sol.pk' })
    });
    console.log('LOGIN', login.status, login.json && (login.json.token ? 'TOKEN' : login.json.error || login.json));

    const order = await fetchJson('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: [{ id: 1, name: 'Test', price: 100, qty: 1 }],
        customer_name: 'Test User',
        address: '123 St',
        phone: '123456789'
      })
    });
    console.log('ORDER', order.status, order.json);

    if (login.json && login.json.token) {
      const orders = await fetchStatus('/api/admin/orders', {
        headers: { Authorization: 'Bearer ' + login.json.token }
      });
      console.log('ADMIN_ORDERS', orders.status);
    }

    const root = await fetchStatus('/');
    console.log('ROOT', root.status);

    const sampleUpload = await fetchStatus('/uploads/1757069175554.jpeg');
    console.log('UPLOAD', sampleUpload.status);
  } catch (err) {
    console.error('SMOKE_ERROR', err && err.message ? err.message : err);
    process.exit(1);
  }
})();


