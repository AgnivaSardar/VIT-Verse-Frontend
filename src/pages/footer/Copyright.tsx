import React from 'react';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import '../../styles/footer-pages.css';

const Copyright: React.FC = () => {
  return (
    <div className="app-container">
      <Header />
      <Sidebar />
      <main className="footer-page">
        <div className="footer-content">
          <h1>Copyright & Intellectual Property</h1>
          
          <section className="content-section">
            <h2>Copyright Policy</h2>
            <p>
              VIT-Verse respects the intellectual property rights of others and expects our users
              to do the same. We respond to notices of alleged copyright infringement that comply
              with applicable law.
            </p>
          </section>

          <section className="content-section">
            <h2>DMCA Notice</h2>
            <p>
              If you believe that your copyrighted work has been copied in a way that constitutes
              copyright infringement and is accessible on VIT-Verse, please notify our copyright
              agent as set forth in the Digital Millennium Copyright Act of 1998 (DMCA).
            </p>
            <p>
              Your notice must include:
            </p>
            <ul>
              <li>A physical or electronic signature of the copyright owner or authorized representative</li>
              <li>Identification of the copyrighted work claimed to have been infringed</li>
              <li>Identification of the material claimed to be infringing with specific location information</li>
              <li>Contact information including address, telephone number, and email</li>
              <li>A statement of good faith belief that the use is not authorized</li>
              <li>A statement that the information in the notification is accurate</li>
            </ul>
          </section>

          <section className="content-section">
            <h2>Counter-Notification</h2>
            <p>
              If you believe that your content was removed by mistake or misidentification, you may
              file a counter-notification with us. Your counter-notification must include specific
              information as outlined in the DMCA.
            </p>
          </section>

          <section className="content-section">
            <h2>Repeat Infringer Policy</h2>
            <p>
              VIT-Verse has adopted a policy of terminating, in appropriate circumstances, the
              accounts of users who are deemed to be repeat infringers.
            </p>
          </section>

          <section className="content-section">
            <h2>Content Ownership</h2>
            <p>
              When you upload content to VIT-Verse, you retain all ownership rights. However, you
              grant VIT-Verse a worldwide, non-exclusive, royalty-free license to use, reproduce,
              distribute, and display your content in connection with the service.
            </p>
          </section>

          <section className="content-section">
            <h2>Contact</h2>
            <p>
              For copyright-related inquiries, please contact: <br />
              <strong>Email:</strong> copyright@vitverse.com <br />
              <strong>Address:</strong> VIT-Verse Legal Department, VIT Campus, Vellore
            </p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Copyright;
