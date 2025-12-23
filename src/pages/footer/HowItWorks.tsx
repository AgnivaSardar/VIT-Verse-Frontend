import React from 'react';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import '../../styles/footer-pages.css';

const HowItWorks: React.FC = () => {
  return (
    <div className="app-container">
      <Header />
      <Sidebar />
      <main className="footer-page">
        <div className="footer-content">
          <h1>How VIT-Verse Works</h1>
          
          <section className="content-section">
            <h2>Platform Overview</h2>
            <p>
              VIT-Verse is a comprehensive video-sharing platform built with modern technologies
              to provide a seamless experience for creators and viewers alike.
            </p>
          </section>

          <section className="content-section">
            <h2>For Creators</h2>
            <div className="steps">
              <div className="step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h3>Create Your Channel</h3>
                  <p>Sign up and create your channel with a unique name, description, and logo.</p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h3>Upload Content</h3>
                  <p>Upload videos with titles, descriptions, tags, and custom thumbnails.</p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h3>Engage with Audience</h3>
                  <p>Respond to comments, track analytics, and build your subscriber base.</p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">4</div>
                <div className="step-content">
                  <h3>Organize with Playlists</h3>
                  <p>Group related videos into playlists for better content discovery.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="content-section">
            <h2>Video Processing Pipeline</h2>
            <p>
              When you upload a video, VIT-Verse automatically processes it:
            </p>
            <ul>
              <li><strong>Upload:</strong> Videos are securely uploaded to AWS S3 storage</li>
              <li><strong>Processing:</strong> FFmpeg extracts metadata and generates thumbnails</li>
              <li><strong>CDN Distribution:</strong> CloudFront delivers content globally with low latency</li>
              <li><strong>Adaptive Streaming:</strong> Videos are served with optimal quality based on bandwidth</li>
              <li><strong>Thumbnail Generation:</strong> Automatic thumbnail extraction or custom upload</li>
            </ul>
          </section>

          <section className="content-section">
            <h2>Discovery & Search</h2>
            <p>
              VIT-Verse uses advanced algorithms to help users find content:
            </p>
            <ul>
              <li><strong>Full-Text Search:</strong> Powered by MeiliSearch for fast, relevant results</li>
              <li><strong>Tag-Based Discovery:</strong> Organize and find content using tags</li>
              <li><strong>Recommendations:</strong> Personalized suggestions based on watch history</li>
              <li><strong>Trending:</strong> Popular videos updated in real-time</li>
              <li><strong>Channel Subscriptions:</strong> Get updates from your favorite creators</li>
            </ul>
          </section>

          <section className="content-section">
            <h2>Engagement Features</h2>
            <div className="features-grid">
              <div className="feature">
                <h3>Likes & Dislikes</h3>
                <p>Express your opinion on videos</p>
              </div>
              <div className="feature">
                <h3>Comments</h3>
                <p>Join discussions and share thoughts</p>
              </div>
              <div className="feature">
                <h3>Subscriptions</h3>
                <p>Follow channels and get notifications</p>
              </div>
              <div className="feature">
                <h3>Playlists</h3>
                <p>Create and share video collections</p>
              </div>
              <div className="feature">
                <h3>Watch History</h3>
                <p>Keep track of videos you've watched</p>
              </div>
              <div className="feature">
                <h3>Notifications</h3>
                <p>Real-time updates on channel activity</p>
              </div>
            </div>
          </section>

          <section className="content-section">
            <h2>Technical Architecture</h2>
            <p>
              VIT-Verse is built with modern, scalable technologies:
            </p>
            <div className="tech-stack">
              <div className="tech-item">
                <h4>Frontend</h4>
                <ul>
                  <li>React 18 with TypeScript</li>
                  <li>React Router for navigation</li>
                  <li>Zustand for state management</li>
                  <li>Tailwind CSS for styling</li>
                </ul>
              </div>
              <div className="tech-item">
                <h4>Backend</h4>
                <ul>
                  <li>Node.js with Express</li>
                  <li>PostgreSQL database</li>
                  <li>Prisma ORM</li>
                  <li>JWT authentication</li>
                </ul>
              </div>
              <div className="tech-item">
                <h4>Infrastructure</h4>
                <ul>
                  <li>AWS S3 for storage</li>
                  <li>CloudFront CDN</li>
                  <li>Redis for caching</li>
                  <li>MeiliSearch for search</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="content-section">
            <h2>Security & Privacy</h2>
            <p>
              Your security is our priority:
            </p>
            <ul>
              <li>End-to-end HTTPS encryption</li>
              <li>Bcrypt password hashing</li>
              <li>JWT-based authentication</li>
              <li>CORS protection</li>
              <li>Rate limiting and DDoS protection</li>
              <li>Regular security audits</li>
            </ul>
          </section>

          <section className="content-section">
            <h2>Performance Optimization</h2>
            <p>
              VIT-Verse delivers fast, reliable performance through:
            </p>
            <ul>
              <li>Global CDN distribution</li>
              <li>Lazy loading and code splitting</li>
              <li>Database query optimization</li>
              <li>Redis caching layer</li>
              <li>Efficient video encoding</li>
              <li>Responsive image optimization</li>
            </ul>
          </section>

          <section className="content-section">
            <h2>Analytics & Insights</h2>
            <p>
              Track your channel's performance:
            </p>
            <ul>
              <li>View counts and watch time</li>
              <li>Subscriber growth trends</li>
              <li>Engagement metrics (likes, comments)</li>
              <li>Traffic sources and demographics</li>
              <li>Popular content analysis</li>
            </ul>
          </section>

          <section className="content-section">
            <h2>Future Roadmap</h2>
            <p>
              Exciting features coming soon:
            </p>
            <ul>
              <li>Live streaming capabilities</li>
              <li>Community posts and polls</li>
              <li>Enhanced creator studio</li>
              <li>Mobile applications (iOS/Android)</li>
              <li>Advanced analytics dashboard</li>
              <li>Monetization options</li>
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
};

export default HowItWorks;
