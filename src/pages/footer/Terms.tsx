import React from 'react';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import '../../styles/footer-pages.css';

const Terms: React.FC = () => {
  return (
    <div className="app-container">
      <Header />
      <Sidebar />
      <main className="footer-page">
        <div className="footer-content">
          <h1>Terms of Service</h1>
          <p className="last-updated">Last Updated: December 23, 2025</p>
          
          <section className="content-section">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing and using VIT-Verse, you accept and agree to be bound by the terms and
              provisions of this agreement. If you do not agree to these terms, please do not use
              this service.
            </p>
          </section>

          <section className="content-section">
            <h2>2. Description of Service</h2>
            <p>
              VIT-Verse provides a video-sharing platform where users can upload, view, share, and
              interact with video content. The service includes but is not limited to:
            </p>
            <ul>
              <li>Video hosting and streaming</li>
              <li>Channel creation and management</li>
              <li>User interactions (likes, comments, subscriptions)</li>
              <li>Content discovery and search</li>
              <li>Playlist management</li>
            </ul>
          </section>

          <section className="content-section">
            <h2>3. User Accounts</h2>
            <p>
              To access certain features, you must create an account. You agree to:
            </p>
            <ul>
              <li>Provide accurate and complete information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Accept responsibility for all activities under your account</li>
              <li>Notify us immediately of any unauthorized access</li>
            </ul>
          </section>

          <section className="content-section">
            <h2>4. Content Guidelines</h2>
            <p>
              Users are responsible for the content they upload. You agree not to upload content that:
            </p>
            <ul>
              <li>Violates any laws or regulations</li>
              <li>Infringes intellectual property rights</li>
              <li>Contains hate speech, violence, or harassment</li>
              <li>Is sexually explicit or promotes illegal activities</li>
              <li>Contains malware or harmful code</li>
              <li>Impersonates others or is misleading</li>
            </ul>
          </section>

          <section className="content-section">
            <h2>5. License to Your Content</h2>
            <p>
              When you upload content, you grant VIT-Verse a worldwide, non-exclusive, royalty-free,
              transferable license to use, reproduce, distribute, display, and perform your content
              in connection with the service.
            </p>
          </section>

          <section className="content-section">
            <h2>6. Prohibited Activities</h2>
            <p>
              You agree not to:
            </p>
            <ul>
              <li>Use automated systems to access the service (bots, scrapers)</li>
              <li>Interfere with or disrupt the service</li>
              <li>Attempt to gain unauthorized access to accounts or systems</li>
              <li>Reverse engineer or modify the platform</li>
              <li>Collect user data without permission</li>
            </ul>
          </section>

          <section className="content-section">
            <h2>7. Termination</h2>
            <p>
              VIT-Verse reserves the right to suspend or terminate your account at any time for
              violations of these terms or for any other reason deemed necessary.
            </p>
          </section>

          <section className="content-section">
            <h2>8. Disclaimers</h2>
            <p>
              The service is provided "as is" without warranties of any kind. VIT-Verse does not
              guarantee uninterrupted or error-free service.
            </p>
          </section>

          <section className="content-section">
            <h2>9. Limitation of Liability</h2>
            <p>
              VIT-Verse shall not be liable for any indirect, incidental, special, consequential,
              or punitive damages resulting from your use of the service.
            </p>
          </section>

          <section className="content-section">
            <h2>10. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. Continued use of the service
              after changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section className="content-section">
            <h2>11. Contact Information</h2>
            <p>
              For questions about these terms, please contact: <br />
              <strong>Email:</strong> legal@vitverse.com
            </p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Terms;
