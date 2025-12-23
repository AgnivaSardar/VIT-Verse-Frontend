import React from 'react';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import '../../styles/footer-pages.css';

const About: React.FC = () => {
  return (
    <div className="app-container">
      <Header />
      <Sidebar />
      <main className="footer-page">
        <div className="footer-content">
          <h1>About VIT-Verse</h1>
          
          <section className="content-section">
            <h2>Our Mission</h2>
            <p>
              VIT-Verse is a video-sharing platform designed specifically for the VIT community.
              We aim to provide a centralized hub where students, faculty, and alumni can share
              knowledge, tutorials, campus events, and creative content.
            </p>
          </section>

          <section className="content-section">
            <h2>What We Offer</h2>
            <ul>
              <li>High-quality video streaming with advanced playback features</li>
              <li>Channel creation for individuals and organizations</li>
              <li>Playlist management for organized content curation</li>
              <li>Real-time notifications and engagement tools</li>
              <li>Advanced search and tag-based discovery</li>
              <li>Subscription system to follow your favorite creators</li>
            </ul>
          </section>

          <section className="content-section">
            <h2>Our Vision</h2>
            <p>
              We envision VIT-Verse as the go-to platform for educational content sharing,
              fostering collaboration, innovation, and knowledge exchange within the VIT ecosystem.
              By empowering creators with robust tools and providing viewers with an intuitive
              experience, we're building a community-driven platform that enhances learning and
              connectivity.
            </p>
          </section>

          <section className="content-section">
            <h2>Technology</h2>
            <p>
              Built with modern web technologies including React, Node.js, PostgreSQL, and AWS
              cloud services, VIT-Verse ensures reliable performance, scalability, and security
              for all users.
            </p>
          </section>

          <section className="content-section">
            <h2>Join Our Community</h2>
            <p>
              Whether you're a content creator, educator, or viewer, VIT-Verse welcomes you.
              Create your channel today and start sharing your knowledge with the world!
            </p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default About;
