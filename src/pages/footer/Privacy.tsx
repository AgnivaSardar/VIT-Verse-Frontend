import React from 'react';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import '../../styles/footer-pages.css';

const Privacy: React.FC = () => {
  return (
    <div className="app-container">
      <Header />
      <Sidebar />
      <main className="footer-page">
        <div className="footer-content">
          <h1>Privacy Policy</h1>
          <p className="last-updated">Last Updated: December 23, 2025</p>
          
          <section className="content-section">
            <h2>1. Information We Collect</h2>
            <p>
              VIT-Verse collects information to provide and improve our services. We collect:
            </p>
            <ul>
              <li><strong>Account Information:</strong> Name, email, password (encrypted)</li>
              <li><strong>Profile Information:</strong> Bio, profile picture, channel details</li>
              <li><strong>Content:</strong> Videos, thumbnails, comments, playlists</li>
              <li><strong>Usage Data:</strong> Video views, watch history, search queries</li>
              <li><strong>Device Information:</strong> IP address, browser type, device type</li>
              <li><strong>Cookies:</strong> Authentication tokens, preferences</li>
            </ul>
          </section>

          <section className="content-section">
            <h2>2. How We Use Your Information</h2>
            <p>
              We use collected information to:
            </p>
            <ul>
              <li>Provide, maintain, and improve VIT-Verse services</li>
              <li>Personalize content recommendations</li>
              <li>Communicate with you about updates and features</li>
              <li>Detect and prevent fraud or abuse</li>
              <li>Analyze usage patterns and trends</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section className="content-section">
            <h2>3. Information Sharing</h2>
            <p>
              We do not sell your personal information. We may share information with:
            </p>
            <ul>
              <li><strong>Other Users:</strong> Your public profile, videos, and comments are visible to others</li>
              <li><strong>Service Providers:</strong> AWS, Cloudflare for hosting and CDN services</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect rights</li>
              <li><strong>Business Transfers:</strong> In case of merger or acquisition</li>
            </ul>
          </section>

          <section className="content-section">
            <h2>4. Data Storage and Security</h2>
            <p>
              Your data is stored securely using industry-standard practices:
            </p>
            <ul>
              <li>Encrypted data transmission (HTTPS/SSL)</li>
              <li>Password encryption using bcrypt</li>
              <li>Secure AWS S3 storage for media files</li>
              <li>Regular security audits and updates</li>
              <li>Access controls and authentication</li>
            </ul>
          </section>

          <section className="content-section">
            <h2>5. Your Rights and Choices</h2>
            <p>
              You have the right to:
            </p>
            <ul>
              <li><strong>Access:</strong> Request a copy of your data</li>
              <li><strong>Correction:</strong> Update or correct your information</li>
              <li><strong>Deletion:</strong> Delete your account and associated data</li>
              <li><strong>Opt-out:</strong> Disable certain features like recommendations</li>
              <li><strong>Export:</strong> Download your content and data</li>
            </ul>
          </section>

          <section className="content-section">
            <h2>6. Cookies and Tracking</h2>
            <p>
              We use cookies and similar technologies for:
            </p>
            <ul>
              <li>Authentication and session management</li>
              <li>User preferences and settings</li>
              <li>Analytics and performance monitoring</li>
              <li>Security and fraud prevention</li>
            </ul>
            <p>
              You can control cookies through your browser settings.
            </p>
          </section>

          <section className="content-section">
            <h2>7. Children's Privacy</h2>
            <p>
              VIT-Verse is intended for users who are at least 13 years old. We do not knowingly
              collect personal information from children under 13.
            </p>
          </section>

          <section className="content-section">
            <h2>8. International Data Transfers</h2>
            <p>
              Your information may be transferred to and processed in countries other than your own.
              We ensure appropriate safeguards are in place to protect your data.
            </p>
          </section>

          <section className="content-section">
            <h2>9. Data Retention</h2>
            <p>
              We retain your information for as long as necessary to provide services and comply
              with legal obligations. Deleted content is permanently removed within 30 days.
            </p>
          </section>

          <section className="content-section">
            <h2>10. Changes to Privacy Policy</h2>
            <p>
              We may update this policy periodically. We will notify users of significant changes
              via email or platform notifications.
            </p>
          </section>

          <section className="content-section">
            <h2>11. Contact Us</h2>
            <p>
              For privacy-related questions or requests: <br />
              <strong>Email:</strong> privacy@vitverse.com <br />
              <strong>Data Protection Officer:</strong> dpo@vitverse.com
            </p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Privacy;
