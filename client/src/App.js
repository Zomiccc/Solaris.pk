import React, { useState, useEffect } from 'react';
import './App.css';

function getSampleProducts() {
  return [
    {
      id: 1,
      name: 'Pink Hairband',
      description: 'Soft, stylish, and perfect for any occasion.',
      price: 199,
      stock: 10,
      image: '/WhatsApp Image 2025-09-05 at 5.43.24 AM.jpeg',
    },
    {
      id: 2,
      name: 'Elegant Hijab',
      description: 'Lightweight, premium fabric, beautiful drape.',
      price: 349,
      stock: 8,
      image: '/WhatsApp Image 2025-09-05 at 5.44.06 AM.jpeg',
    },
    {
      id: 3,
      name: 'Colorful Beads Set',
      description: 'Vibrant beads for creative jewelry making.',
      price: 149,
      stock: 15,
      image: '/WhatsApp Image 2025-09-05 at 5.45.28 AM.jpeg',
    },
    {
      id: 4,
      name: 'Trendy Ketcher',
      description: 'Trendy hair ketcher for a secure hold.',
      price: 99,
      stock: 20,
      image: '/WhatsApp Image 2025-09-05 at 5.48.40 AM.jpeg',
    },
    {
      id: 5,
      name: 'Chic Rings Set',
      description: 'Set of 5 chic rings for every mood.',
      price: 299,
      stock: 12,
      image: '/WhatsApp Image 2025-09-05 at 5.54.10 AM.jpeg',
    },
  ];
}

const API_BASE = process.env.REACT_APP_API_BASE
  || (process.env.NODE_ENV === 'production'
    ? (typeof window !== 'undefined' ? window.location.origin : '')
    : 'http://localhost:5000');
  
function resolveProductImageSrc(image) {
  if (!image) return '';
  if (image.startsWith('http')) return image;
  if (image.startsWith('/')) return image; // public folder
  // default to backend uploads
  return API_BASE + '/uploads/' + image;
}

function safeFetchJson(url, options = {}) {
  return fetch(url, options).then(async (res) => {
    const contentType = res.headers.get('content-type') || '';
    let payload;
    try {
      if (contentType.includes('application/json')) {
        payload = await res.json();
      } else {
        const text = await res.text();
        // Try JSON parse as a fallback, else wrap the text
        try {
          payload = JSON.parse(text);
        } catch {
          payload = { error: text }; // non-JSON (e.g., HTML) response
        }
      }
    } catch (e) {
      payload = { error: e.message || 'Failed to parse response' };
    }
    if (!res.ok) {
      const message = (payload && payload.error) ? payload.error : `HTTP ${res.status}`;
      throw new Error(message);
    }
    return payload;
  });
}

function App() {
  const [page, setPage] = useState('products');
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checkout, setCheckout] = useState({ name: '', address: '', phone: '' });
  const [orderStatus, setOrderStatus] = useState('');
  const [admin, setAdmin] = useState({ loggedIn: false, token: '', error: '' });
  const [adminForm, setAdminForm] = useState({ username: '', password: '' });
  const [adminProducts, setAdminProducts] = useState([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminProductForm, setAdminProductForm] = useState({ name: '', description: '', price: '', stock: '', image: null });
  const [adminActionMsg, setAdminActionMsg] = useState('');
  const [lastOrder, setLastOrder] = useState(null);
  const [adminOrders, setAdminOrders] = useState([]);
  const [adminOrdersLoading, setAdminOrdersLoading] = useState(false);
  const [adminOrdersError, setAdminOrdersError] = useState('');
  const [ordersLastRefreshed, setOrdersLastRefreshed] = useState(null);

  useEffect(() => {
    if (page === 'products' || page === 'admin') {
      setLoading(true);
      fetch(API_BASE + '/api/products')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data) && data.length > 0) {
            setProducts(data);
            if (page === 'admin') setAdminProducts(data);
          } else {
            setProducts(getSampleProducts());
            if (page === 'admin') setAdminProducts(getSampleProducts());
          }
          setLoading(false);
        })
        .catch(() => {
          setProducts(getSampleProducts());
          if (page === 'admin') setAdminProducts(getSampleProducts());
          setError('Failed to load products (showing samples)');
          setLoading(false);
        });
    }
  }, [page, adminActionMsg]);

  // Fetch products for admin dashboard
  useEffect(() => {
    if (page === 'admin' && admin.loggedIn) {
      setAdminLoading(true);
      fetch(API_BASE + '/api/products')
        .then(res => res.json())
        .then(data => {
          setAdminProducts(data);
          setAdminLoading(false);
        })
        .catch(() => setAdminLoading(false));
    }
  }, [page, admin.loggedIn, adminActionMsg]);

  // Fetch orders for admin dashboard
  useEffect(() => {
    if (page === 'admin' && admin.loggedIn) {
      setAdminOrdersLoading(true);
      fetch(API_BASE + '/api/admin/orders', {
        headers: { Authorization: 'Bearer ' + admin.token }
      })
        .then(res => res.json())
        .then(data => {
          setAdminOrders(data);
          setAdminOrdersLoading(false);
        })
        .catch(() => setAdminOrdersLoading(false));
    }
  }, [page, admin.loggedIn, adminActionMsg, admin.token]);

  useEffect(() => {
    if (page === 'admin' && admin.loggedIn) {
      setAdminOrdersLoading(true);
      setAdminOrdersError('');
      safeFetchJson(API_BASE + '/api/admin/orders', {
        headers: { Authorization: 'Bearer ' + admin.token }
      })
        .then(data => {
          setAdminOrders(Array.isArray(data) ? data : []);
          setOrdersLastRefreshed(new Date());
          setAdminOrdersLoading(false);
        })
        .catch(err => {
          setAdminOrdersError(err.message || 'Failed to fetch orders');
          setAdminOrdersLoading(false);
        });
    }
  }, [page, admin.loggedIn, adminActionMsg, admin.token]);

  // Auto-refresh orders every 6s while on admin page
  useEffect(() => {
    if (page === 'admin' && admin.loggedIn) {
      const interval = setInterval(() => {
        safeFetchJson(API_BASE + '/api/admin/orders', {
          headers: { Authorization: 'Bearer ' + admin.token }
        })
          .then(data => {
            setAdminOrders(Array.isArray(data) ? data : []);
            setOrdersLastRefreshed(new Date());
          })
          .catch(() => {});
      }, 6000);
      return () => clearInterval(interval);
    }
  }, [page, admin.loggedIn, admin.token]);

  function addToCart(product) {
    setCart(prev => {
      const found = prev.find(item => item.id === product.id);
      if (found) {
        return prev.map(item =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      } else {
        return [...prev, { ...product, qty: 1 }];
      }
    });
  }

  return (
    <div className="App">
      <div className="topbar">
        <div>Exclusively Online · Free delivery on orders over Rs 5000 · Support: +9203320907957</div>
      </div>
      <div className="hero-banner">
        <img src="/logo.jpg" alt="Solaris Logo" />
        <div className="hero-text">
          <h1>Solaris</h1>
          <p>Discover beautiful hairbands, hijabs, beads, rings, and more!<br />
          Accessories for every style, every day. Shop the latest trends in ladies' fashion accessories.</p>
        </div>
      </div>
      <nav className="App-nav">
        <button onClick={() => setPage('products')}>Products</button>
        <button onClick={() => setPage('cart')}>Cart ({cart.reduce((a, b) => a + b.qty, 0)})</button>
        <button onClick={() => setPage('admin')}>Admin</button>
      </nav>
      <div className="main-container">
        <div className="side-content left">
          <div className="side-card">
            <h3>✨ Trending Now</h3>
            <div className="trending-item">
              <span className="trend-icon">🔥</span>
              <span>Pink Hairbands</span>
            </div>
            <div className="trending-item">
              <span className="trend-icon">⭐</span>
              <span>Elegant Hijabs</span>
            </div>
            <div className="trending-item">
              <span className="trend-icon">💎</span>
              <span>Chic Rings</span>
            </div>
          </div>
          <div className="side-card">
            <h3>🎁 Special Offers</h3>
            <div className="offer-item">
              <span className="offer-badge">50% OFF</span>
              <span>First Order</span>
            </div>
            <div className="offer-item">
              <span className="offer-badge">FREE</span>
              <span>Delivery Rs 5000+</span>
            </div>
          </div>
        </div>

        <main>
          {page === 'products' && (
            <div>
              <h2>Products</h2>
              <div className="categories">
                <div className="cat">Hairbands</div>
                <div className="cat">Hijabs</div>
                <div className="cat">Beads</div>
                <div className="cat">Rings</div>
                <div className="cat">Ketchers</div>
              </div>
            {loading && <p>Loading...</p>}
            {error && <p style={{color:'red'}}>{error}</p>}
            <div className="product-list">
              {products.map(product => (
                <div key={product.id} className="product-card">
                  <img src={resolveProductImageSrc(product.image)} alt={product.name} />
                  <h3>{product.name}</h3>
                  <p>{product.description}</p>
                  <div className="price">Rs {product.price}</div>
                  <button onClick={() => addToCart(product)} disabled={product.stock < 1}>
                    {product.stock < 1 ? 'Out of Stock' : 'Add to Cart'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        {page === 'cart' && (
          <div className="cart-container">
            <h2 className="cart-title">🛒 Your Shopping Cart</h2>
            {cart.length === 0 ? (
              <div className="empty-cart">
                <div className="empty-cart-icon">🛒</div>
                <h3>Your cart is empty</h3>
                <p>Add some beautiful accessories to get started!</p>
                <button 
                  onClick={() => setPage('products')} 
                  className="continue-shopping-btn"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <>
                <div className="cart-items">
                  {cart.map(item => (
                    <div key={item.id} className="cart-item">
                      <img src={resolveProductImageSrc(item.image)} alt={item.name} className="cart-item-image" />
                      <div className="cart-item-details">
                        <h4>{item.name}</h4>
                        <p className="cart-item-description">{item.description}</p>
                        <div className="cart-item-price">Rs {item.price}</div>
                      </div>
                      <div className="cart-item-controls">
                        <button 
                          onClick={() => {
                            setCart(prev => prev.map(cartItem => 
                              cartItem.id === item.id 
                                ? { ...cartItem, qty: Math.max(0, cartItem.qty - 1) }
                                : cartItem
                            ).filter(cartItem => cartItem.qty > 0));
                          }}
                          className="qty-btn minus"
                        >-</button>
                        <span className="qty-display">{item.qty}</span>
                        <button 
                          onClick={() => {
                            setCart(prev => prev.map(cartItem => 
                              cartItem.id === item.id 
                                ? { ...cartItem, qty: cartItem.qty + 1 }
                                : cartItem
                            ));
                          }}
                          className="qty-btn plus"
                        >+</button>
                      </div>
                      <div className="cart-item-total">Rs {item.price * item.qty}</div>
                    </div>
                  ))}
                </div>
                
                <div className="cart-summary">
                  <div className="total-section">
                    <h3>Order Summary</h3>
                    <div className="total-line">
                      <span>Subtotal:</span>
                      <span>Rs {cart.reduce((total, item) => total + (item.price * item.qty), 0)}</span>
                    </div>
                    <div className="total-line">
                      <span>Delivery:</span>
                      <span className="free-delivery">FREE (Orders over Rs 5000)</span>
                    </div>
                    <div className="total-line final-total">
                      <span>Total:</span>
                      <span>Rs {cart.reduce((total, item) => total + (item.price * item.qty), 0)}</span>
                    </div>
                  </div>
                </div>

                <div className="checkout-section">
                  <h3>📋 Checkout Information</h3>
                  <form onSubmit={async e => {
                    e.preventDefault();
                    setLastOrder(null);
                    try {
                      const res = await fetch(API_BASE + '/api/orders', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          items: cart.map(({id, name, price, qty}) => ({id, name, price, qty})),
                          customer_name: checkout.name,
                          address: checkout.address,
                          phone: checkout.phone
                        })
                      });
                      const data = await res.json();
                      if (res.ok) {
                        setOrderStatus('confirmed');
                        setLastOrder({
                          orderId: data.orderId,
                          items: cart,
                          customer: { ...checkout }
                        });
                        setCart([]);
                        setCheckout({ name: '', address: '', phone: '' });
                        setError(''); // clear error on success
                      } else {
                        setOrderStatus('failed');
                        setError(data.error || 'Order failed');
                      }
                    } catch (err) {
                      setOrderStatus('failed');
                      setError(err.message || 'Order failed');
                    }
                  }} className="checkout-form">
                    <div className="form-group">
                      <label>Full Name *</label>
                      <input 
                        required 
                        placeholder="Enter your full name" 
                        value={checkout.name} 
                        onChange={e => setCheckout(c => ({...c, name: e.target.value}))} 
                      />
                    </div>
                    <div className="form-group">
                      <label>Delivery Address *</label>
                      <textarea 
                        required 
                        placeholder="Enter your complete delivery address" 
                        value={checkout.address} 
                        onChange={e => setCheckout(c => ({...c, address: e.target.value}))}
                        rows="3"
                      />
                    </div>
                    <div className="form-group">
                      <label>Phone Number *</label>
                      <input 
                        required 
                        placeholder="Enter your phone number" 
                        value={checkout.phone} 
                        onChange={e => setCheckout(c => ({...c, phone: e.target.value}))} 
                      />
                    </div>
                    <button type="submit" className="place-order-btn">
                      🚀 Place Order - Rs {cart.reduce((total, item) => total + (item.price * item.qty), 0)}
                    </button>
                  </form>
                </div>

                {orderStatus === 'confirmed' && (
                  <div className="order-confirmation">
                    <div className="confirmation-header">
                      <div className="success-icon">✅</div>
                      <h2>Order Confirmed!</h2>
                      <p className="confirmation-message">Thank you for your purchase! Your order has been successfully placed and will be processed shortly.</p>
                    </div>
                    {lastOrder && (
                      <div className="order-details">
                        <h3>📋 Order Details</h3>
                        <div className="order-info-grid">
                          <div className="info-item">
                            <span className="info-label">Order ID:</span>
                            <span className="info-value">#{lastOrder.orderId}</span>
                          </div>
                          <div className="info-item">
                            <span className="info-label">Customer:</span>
                            <span className="info-value">{lastOrder.customer.name}</span>
                          </div>
                          <div className="info-item">
                            <span className="info-label">Phone:</span>
                            <span className="info-value">{lastOrder.customer.phone}</span>
                          </div>
                          <div className="info-item full-width">
                            <span className="info-label">Address:</span>
                            <span className="info-value">{lastOrder.customer.address}</span>
                          </div>
                        </div>
                        <div className="ordered-items">
                          <h4>📦 Ordered Items</h4>
                          {lastOrder.items.map(item => (
                            <div key={item.id} className="ordered-item">
                              <span className="item-name">{item.name}</span>
                              <span className="item-qty">x{item.qty}</span>
                              <span className="item-price">Rs {item.price * item.qty}</span>
                            </div>
                          ))}
                        </div>
                        <div className="order-total">
                          <span>Total Amount:</span>
                          <span>Rs {lastOrder.items.reduce((total, item) => total + (item.price * item.qty), 0)}</span>
                        </div>
                      </div>
                    )}
                    <div className="confirmation-footer">
                      <p>📞 We'll contact you soon for order confirmation and delivery details.</p>
                      <button 
                        onClick={() => setPage('products')} 
                        className="continue-shopping-btn"
                      >
                        Continue Shopping
                      </button>
                    </div>
                  </div>
                )}

                {orderStatus === 'failed' && (
                  <div className="order-error">
                    <div className="error-icon">❌</div>
                    <h3>Order Failed</h3>
                    <p>Sorry, there was an issue processing your order. Please try again or contact support.</p>
                    <button 
                      onClick={() => setOrderStatus('')} 
                      className="retry-btn"
                    >
                      Try Again
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
        {page === 'admin' && (
          <div>
            {!admin.loggedIn ? (
              <form onSubmit={async e => {
                e.preventDefault();
                setAdmin(a => ({...a, error: ''}));
                try {
                  const res = await fetch(API_BASE + '/api/admin/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(adminForm)
                  });
                  const data = await res.json();
                  if (res.ok && data.token) {
                    setAdmin({ loggedIn: true, token: data.token, error: '' });
                    setAdminOrdersLoading(true);
                    setAdminOrdersError('');
                    setError(''); // clear error on success
                    safeFetchJson(API_BASE + '/api/admin/orders', {
                      headers: { Authorization: 'Bearer ' + data.token }
                    })
                      .then(d => {
                        setAdminOrders(Array.isArray(d) ? d : []);
                        setOrdersLastRefreshed(new Date());
                        setAdminOrdersLoading(false);
                      })
                      .catch(err => {
                        setAdminOrdersError(err.message || 'Failed to fetch orders');
                        setAdminOrdersLoading(false);
                      });
                  } else {
                    setAdmin(a => ({...a, error: data.error || 'Login failed'}));
                  }
                } catch (err) {
                  setAdmin(a => ({...a, error: 'Login failed'}));
                }
              }} style={{maxWidth:320,margin:'40px auto'}}>
                <h2>Admin Login</h2>
                <input required placeholder="Username" value={adminForm.username} onChange={e => setAdminForm(f => ({...f, username: e.target.value}))} style={{width:'100%',padding:8,marginBottom:8}} />
                <input required type="password" placeholder="Password" value={adminForm.password} onChange={e => setAdminForm(f => ({...f, password: e.target.value}))} style={{width:'100%',padding:8,marginBottom:8}} />
                <button type="submit" style={{
                  padding:'12px 24px', 
                  background:'linear-gradient(90deg, #d81b60 0%, #6a1b9a 100%)', 
                  color:'white', 
                  border:'none', 
                  borderRadius:'12px', 
                  fontSize:'1.1rem', 
                  fontWeight:'700', 
                  cursor:'pointer',
                  boxShadow:'0 4px 15px rgba(216,27,96,0.3)',
                  transition:'all 0.3s ease'
                }}>Login</button>
                {admin.error && <p style={{color:'red'}}>{admin.error}</p>}
              </form>
            ) : (
              <div style={{maxWidth:600,margin:'40px auto'}}>
                <h2>Admin Dashboard</h2>
                <button onClick={() => setAdmin({ loggedIn: false, token: '', error: '' })} style={{
                  float:'right',
                  padding:'10px 20px',
                  background:'linear-gradient(90deg, #f44336 0%, #d32f2f 100%)',
                  color:'white',
                  border:'none',
                  borderRadius:'12px',
                  cursor:'pointer',
                  fontWeight:'700',
                  fontSize:'1rem',
                  boxShadow:'0 4px 15px rgba(244,67,54,0.3)',
                  transition:'all 0.3s ease'
                }}>Logout</button>
                <h3>Add Product</h3>
                <form onSubmit={async e => {
                  e.preventDefault();
                  setAdminActionMsg('');
                  const formData = new FormData();
                  formData.append('name', adminProductForm.name);
                  formData.append('description', adminProductForm.description);
                  formData.append('price', adminProductForm.price);
                  formData.append('stock', adminProductForm.stock);
                  if (adminProductForm.image) formData.append('image', adminProductForm.image);
                  try {
                    const res = await fetch(API_BASE + '/api/admin/products', {
                      method: 'POST',
                      headers: { Authorization: 'Bearer ' + admin.token },
                      body: formData
                    });
                    const data = await res.json();
                    if (res.ok) {
                      setAdminActionMsg('Product added!');
                      setAdminProductForm({ name: '', description: '', price: '', stock: '', image: null });
                    } else {
                      setAdminActionMsg(data.error || 'Failed to add product');
                    }
                  } catch {
                    setAdminActionMsg('Failed to add product');
                  }
                }} style={{marginBottom:24}}>
                  <input required placeholder="Name" value={adminProductForm.name} onChange={e => setAdminProductForm(f => ({...f, name: e.target.value}))} style={{width:'100%',padding:8,marginBottom:8}} />
                  <input placeholder="Description" value={adminProductForm.description} onChange={e => setAdminProductForm(f => ({...f, description: e.target.value}))} style={{width:'100%',padding:8,marginBottom:8}} />
                  <input required type="number" placeholder="Price" value={adminProductForm.price} onChange={e => setAdminProductForm(f => ({...f, price: e.target.value}))} style={{width:'100%',padding:8,marginBottom:8}} />
                  <input required type="number" placeholder="Stock" value={adminProductForm.stock} onChange={e => setAdminProductForm(f => ({...f, stock: e.target.value}))} style={{width:'100%',padding:8,marginBottom:8}} />
                  <input type="file" accept="image/*" onChange={e => setAdminProductForm(f => ({...f, image: e.target.files[0]}))} style={{marginBottom:8}} />
                  <button type="submit" style={{
                    padding:'12px 24px',
                    background:'linear-gradient(90deg, #4caf50 0%, #2e7d32 100%)',
                    color:'white',
                    border:'none',
                    borderRadius:'12px',
                    fontSize:'1.1rem',
                    fontWeight:'700',
                    cursor:'pointer',
                    boxShadow:'0 4px 15px rgba(76,175,80,0.3)',
                    transition:'all 0.3s ease'
                  }}>Add Product</button>
                </form>
                {adminActionMsg && <p style={{color: adminActionMsg.startsWith('Product added') ? 'green' : 'red'}}>{adminActionMsg}</p>}
                <h3>Products</h3>
                {adminLoading ? <p>Loading...</p> : (
                  <div style={{display:'flex',flexWrap:'wrap',gap:'2rem'}}>
                    {adminProducts.map(product => (
                      <div key={product.id} style={{border:'1px solid #eee',borderRadius:8,padding:16,width:220,background:'#fafafa',position:'relative'}}>
                        {product.image && (
                          <img src={API_BASE + '/uploads/' + product.image} alt={product.name} style={{width:'100%',height:120,objectFit:'cover',borderRadius:4}} />
                        )}
                        <h4>{product.name}</h4>
                        <p>{product.description}</p>
                        <div>Rs {product.price} | Stock: {product.stock}</div>
                        <button onClick={async () => {
                          setAdminActionMsg('');
                          try {
                            const res = await fetch(API_BASE + '/api/admin/products/' + product.id, {
                              method: 'DELETE',
                              headers: { Authorization: 'Bearer ' + admin.token }
                            });
                            const data = await res.json();
                            if (res.ok) {
                              setAdminActionMsg('Product removed');
                            } else {
                              setAdminActionMsg(data.error || 'Failed to remove');
                            }
                          } catch {
                            setAdminActionMsg('Failed to remove');
                          }
                        }} style={{
                          position:'absolute',
                          top:8,
                          right:8,
                          padding:'6px 12px',
                          background:'linear-gradient(90deg, #f44336 0%, #d32f2f 100%)',
                          color:'white',
                          border:'none',
                          borderRadius:'8px',
                          fontSize:'0.9rem',
                          fontWeight:'700',
                          cursor:'pointer',
                          boxShadow:'0 2px 8px rgba(244,67,54,0.3)',
                          transition:'all 0.3s ease'
                        }}>Remove</button>
                      </div>
                    ))}
                  </div>
                )}
                {admin.loggedIn && (
                  <div style={{marginTop:40}}>
                    <h3>Recent Orders</h3>
                    <div style={{marginBottom:8}}>
                      <button onClick={() => {
                        setAdminOrdersLoading(true);
                        setAdminOrdersError('');
                        safeFetchJson(API_BASE + '/api/admin/orders', {
                          headers: { Authorization: 'Bearer ' + admin.token }
                        })
                          .then(data => {
                            setAdminOrders(Array.isArray(data) ? data : []);
                            setOrdersLastRefreshed(new Date());
                            setAdminOrdersLoading(false);
                          })
                          .catch(err => {
                            setAdminOrdersError(err.message || 'Failed to fetch orders');
                            setAdminOrdersLoading(false);
                          });
                      }} style={{
                        padding:'8px 16px',
                        background:'linear-gradient(90deg, #2196f3 0%, #1976d2 100%)',
                        color:'white',
                        border:'none',
                        borderRadius:'8px',
                        fontSize:'0.9rem',
                        fontWeight:'700',
                        cursor:'pointer',
                        boxShadow:'0 2px 8px rgba(33,150,243,0.3)',
                        transition:'all 0.3s ease'
                      }}>Refresh</button>
                      {ordersLastRefreshed && (
                        <span style={{marginLeft:12, fontSize:'0.9rem', color:'#555'}}>Last updated: {ordersLastRefreshed.toLocaleTimeString()}</span>
                      )}
                    </div>
                    {adminOrdersError && <p style={{color:'red'}}>{adminOrdersError}</p>}
                    {adminOrdersLoading ? <p>Loading orders...</p> : (
                      <div style={{maxHeight:350,overflowY:'auto',margin:'0 auto',background:'#f8e1f4',borderRadius:12,padding:16,boxShadow:'0 2px 8px #b2ebf2'}}>
                        {adminOrders.length === 0 ? <p>No orders yet.</p> : (
                          adminOrders.map(order => (
                            <div key={order.id} style={{marginBottom:18,padding:12,background:'#fff',borderRadius:8,boxShadow:'0 1px 4px #e0f7fa'}}>
                              <div><b>Order ID:</b> {order.id}</div>
                              <div><b>Customer:</b> {order.customer_name}</div>
                              <div><b>Address:</b> {order.address}</div>
                              <div><b>Phone:</b> {order.phone}</div>
                              <div><b>Placed:</b> {new Date(order.created_at).toLocaleString()}</div>
                              <div><b>Status:</b> {order.status}</div>
                              <div><b>Items:</b>
                                <ul style={{listStyle:'none',padding:0}}>
                                  {order.items.map((item, idx) => (
                                    <li key={idx}>{item.name} x {item.qty} = Rs {item.price * item.qty}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        </main>

        <div className="side-content right">
          <div className="side-card">
            <h3>📱 Stay Connected</h3>
            <div className="social-item">
              <span className="social-icon">📸</span>
              <span>@solaris_.pk</span>
            </div>
            <div className="social-item">
              <span className="social-icon">💬</span>
              <span>WhatsApp: +9203320907957</span>
            </div>
            <div className="social-item">
              <span className="social-icon">📧</span>
              <span>zsafeer563@gmail.com</span>
            </div>
          </div>
          <div className="side-card">
            <h3>🚚 Quick Info</h3>
            <div className="info-item">
              <span className="info-icon">⚡</span>
              <span>Same Day Dispatch</span>
            </div>
            <div className="info-item">
              <span className="info-icon">🛡️</span>
              <span>Secure Payment</span>
            </div>
            <div className="info-item">
              <span className="info-icon">↩️</span>
              <span>Easy Returns</span>
            </div>
          </div>
        </div>
      </div>
      <footer>
        <div className="footer-content">
          <div className="footer-section">
            <h4>Contact Us</h4>
            <p>📧 zsafeer563@gmail.com</p>
            <p>📱 +9203320907957</p>
          </div>
          <div className="footer-section">
            <h4>Follow Us</h4>
            <p>📸 Instagram: @solaris_.pk</p>
            <p>💬 WhatsApp: +9203320907957</p>
          </div>
          <div className="footer-section">
            <h4>Solaris</h4>
            <p>&copy; {new Date().getFullYear()} All rights reserved</p>
            <p>Beautiful accessories for every style</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
