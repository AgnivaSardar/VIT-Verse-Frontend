import React from 'react';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import '../../styles/footer-pages.css';

const Developers: React.FC = () => {
  return (
    <div className="app-container">
      <Header />
      <Sidebar />
      <main className="footer-page">
        <div className="footer-content">
          <h1>Developer Resources</h1>
          
          <section className="content-section">
            <h2>VIT-Verse API</h2>
            <p>
              Build amazing applications using the VIT-Verse API. Access video content, user data,
              channel information, and more through our comprehensive REST API.
            </p>
          </section>

          <section className="content-section">
            <h2>Getting Started</h2>
            <div className="code-block">
              <h3>Authentication</h3>
              <pre>{`// Example API Request with JWT Token
const response = await fetch('https://api.vitverse.com/v1/videos', {
  headers: {
    'Authorization': 'Bearer YOUR_JWT_TOKEN',
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
console.log(data);`}</pre>
            </div>
          </section>

          <section className="content-section">
            <h2>Available Endpoints</h2>
            <div className="api-endpoints">
              <div className="endpoint">
                <h4>Videos</h4>
                <ul>
                  <li><code>GET /api/videos</code> - List all videos</li>
                  <li><code>GET /api/videos/:id</code> - Get video details</li>
                  <li><code>POST /api/videos</code> - Upload new video</li>
                  <li><code>PUT /api/videos/:id</code> - Update video</li>
                  <li><code>DELETE /api/videos/:id</code> - Delete video</li>
                </ul>
              </div>

              <div className="endpoint">
                <h4>Channels</h4>
                <ul>
                  <li><code>GET /api/channels</code> - List all channels</li>
                  <li><code>GET /api/channels/:id</code> - Get channel details</li>
                  <li><code>POST /api/channels</code> - Create channel</li>
                  <li><code>PUT /api/channels/:id</code> - Update channel</li>
                </ul>
              </div>

              <div className="endpoint">
                <h4>Users</h4>
                <ul>
                  <li><code>GET /api/users/me</code> - Get current user</li>
                  <li><code>PUT /api/users/me</code> - Update profile</li>
                  <li><code>POST /api/auth/login</code> - Login</li>
                  <li><code>POST /api/auth/register</code> - Register</li>
                </ul>
              </div>

              <div className="endpoint">
                <h4>Search</h4>
                <ul>
                  <li><code>GET /api/search?q=query</code> - Search videos</li>
                  <li><code>GET /api/tags/search?q=query</code> - Search tags</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="content-section">
            <h2>SDK Libraries</h2>
            <div className="sdk-list">
              <div className="sdk-item">
                <h3>JavaScript/TypeScript</h3>
                <pre>{`npm install @vitverse/sdk`}</pre>
              </div>
              <div className="sdk-item">
                <h3>Python</h3>
                <pre>{`pip install vitverse`}</pre>
              </div>
              <div className="sdk-item">
                <h3>Java</h3>
                <pre>{`implementation 'com.vitverse:sdk:1.0.0'`}</pre>
              </div>
            </div>
          </section>

          <section className="content-section">
            <h2>Rate Limits</h2>
            <p>
              API requests are rate-limited to ensure fair usage:
            </p>
            <ul>
              <li><strong>Authenticated requests:</strong> 1000 requests per hour</li>
              <li><strong>Unauthenticated requests:</strong> 100 requests per hour</li>
              <li><strong>Upload endpoints:</strong> 50 requests per hour</li>
            </ul>
          </section>

          <section className="content-section">
            <h2>Webhooks</h2>
            <p>
              Subscribe to real-time events using webhooks. Get notified when:
            </p>
            <ul>
              <li>New video is uploaded to a channel</li>
              <li>Video processing is completed</li>
              <li>New comment is posted</li>
              <li>User subscribes to a channel</li>
            </ul>
          </section>

          <section className="content-section">
            <h2>Support</h2>
            <p>
              Need help with the API? Check out our documentation or reach out:
            </p>
            <ul>
              <li><strong>Documentation:</strong> <a href="https://docs.vitverse.com">docs.vitverse.com</a></li>
              <li><strong>GitHub:</strong> <a href="https://github.com/vitverse">github.com/vitverse</a></li>
              <li><strong>Developer Forum:</strong> <a href="https://forum.vitverse.com">forum.vitverse.com</a></li>
              <li><strong>Email:</strong> developers@vitverse.com</li>
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Developers;
