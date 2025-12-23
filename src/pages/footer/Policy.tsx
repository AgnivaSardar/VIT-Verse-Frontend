import React from 'react';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import '../../styles/footer-pages.css';

const Policy: React.FC = () => {
  return (
    <div className="app-container">
      <Header />
      <Sidebar />
      <main className="footer-page">
        <div className="footer-content">
          <h1>Policy & Safety</h1>
          
          <section className="content-section">
            <h2>Community Guidelines</h2>
            <p>
              VIT-Verse is committed to maintaining a safe, respectful, and inclusive environment
              for all users. Our community guidelines help ensure positive interactions.
            </p>
          </section>

          <section className="content-section">
            <h2>Prohibited Content</h2>
            <div className="policy-grid">
              <div className="policy-item">
                <h3>Violence & Harm</h3>
                <p>Content that promotes violence, self-harm, or dangerous activities is prohibited.</p>
              </div>
              <div className="policy-item">
                <h3>Hate Speech</h3>
                <p>Content that promotes hatred or discrimination based on race, religion, gender, or other protected characteristics.</p>
              </div>
              <div className="policy-item">
                <h3>Harassment</h3>
                <p>Bullying, stalking, threats, or any form of harassment towards individuals or groups.</p>
              </div>
              <div className="policy-item">
                <h3>Adult Content</h3>
                <p>Sexually explicit content, nudity, or content intended for adult audiences only.</p>
              </div>
              <div className="policy-item">
                <h3>Misinformation</h3>
                <p>Deliberately false or misleading information, especially regarding health, elections, or emergencies.</p>
              </div>
              <div className="policy-item">
                <h3>Spam & Scams</h3>
                <p>Misleading content, phishing attempts, pyramid schemes, or repetitive spam.</p>
              </div>
            </div>
          </section>

          <section className="content-section">
            <h2>Content Moderation</h2>
            <p>
              VIT-Verse uses a combination of automated systems and human review to enforce policies:
            </p>
            <ul>
              <li>Automated detection of policy violations</li>
              <li>User reporting system for flagging inappropriate content</li>
              <li>Manual review by trained moderators</li>
              <li>Progressive enforcement (warnings, strikes, suspensions)</li>
            </ul>
          </section>

          <section className="content-section">
            <h2>Reporting Content</h2>
            <p>
              If you encounter content that violates our policies:
            </p>
            <ol>
              <li>Click the "Report" button on the video or comment</li>
              <li>Select the reason for reporting</li>
              <li>Provide additional context if needed</li>
              <li>Our team will review and take appropriate action</li>
            </ol>
            <p>
              False or malicious reports may result in account restrictions.
            </p>
          </section>

          <section className="content-section">
            <h2>Strike System</h2>
            <p>
              Violations of community guidelines may result in strikes:
            </p>
            <ul>
              <li><strong>First Strike:</strong> Warning and content removal</li>
              <li><strong>Second Strike:</strong> 7-day upload restriction</li>
              <li><strong>Third Strike:</strong> Account termination</li>
            </ul>
            <p>
              Severe violations may result in immediate account termination.
            </p>
          </section>

          <section className="content-section">
            <h2>Age-Restricted Content</h2>
            <p>
              Some content may be age-restricted but not removed if it:
            </p>
            <ul>
              <li>Contains educational or documentary value</li>
              <li>Includes mature themes but doesn't violate policies</li>
              <li>Is artistic or satirical in nature</li>
            </ul>
            <p>
              Age-restricted content is only visible to users 18+ who are signed in.
            </p>
          </section>

          <section className="content-section">
            <h2>Copyright Protection</h2>
            <p>
              VIT-Verse respects intellectual property rights:
            </p>
            <ul>
              <li>Automated Content ID system for copyright detection</li>
              <li>DMCA takedown process for copyright holders</li>
              <li>Three-strike policy for repeat copyright infringers</li>
              <li>Counter-notification process for disputed claims</li>
            </ul>
          </section>

          <section className="content-section">
            <h2>User Safety Features</h2>
            <p>
              Tools to help you stay safe on VIT-Verse:
            </p>
            <ul>
              <li>Block and report users</li>
              <li>Comment filtering and moderation</li>
              <li>Privacy settings for videos and channels</li>
              <li>Restricted mode for filtering sensitive content</li>
            </ul>
          </section>

          <section className="content-section">
            <h2>Appeals Process</h2>
            <p>
              If you believe content was removed or your account was restricted by mistake:
            </p>
            <ol>
              <li>Submit an appeal through your account dashboard</li>
              <li>Provide explanation and supporting evidence</li>
              <li>Our team will review within 3-5 business days</li>
              <li>You will be notified of the decision</li>
            </ol>
          </section>

          <section className="content-section">
            <h2>Contact Safety Team</h2>
            <p>
              For urgent safety concerns: <br />
              <strong>Email:</strong> safety@vitverse.com <br />
              <strong>Emergency:</strong> For immediate threats, contact local authorities first
            </p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Policy;
