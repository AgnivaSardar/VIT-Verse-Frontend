import React, { useState } from 'react';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import { toast } from 'react-hot-toast';
import '../../styles/footer-pages.css';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate form submission
    toast.success('Thank you for contacting us! We\'ll get back to you soon.');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="app-container">
      <Header />
      <Sidebar />
      <main className="footer-page">
        <div className="footer-content">
          <h1>Contact Us</h1>
          
          <section className="content-section">
            <h2>Get in Touch</h2>
            <p>
              Have questions, feedback, or need assistance? We're here to help! Fill out the form
              below and our team will respond as soon as possible.
            </p>
          </section>

          <section className="content-section">
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Your full name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="your.email@example.com"
                />
              </div>

              <div className="form-group">
                <label htmlFor="subject">Subject *</label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a subject</option>
                  <option value="general">General Inquiry</option>
                  <option value="technical">Technical Support</option>
                  <option value="content">Content Issues</option>
                  <option value="account">Account Help</option>
                  <option value="partnership">Partnership</option>
                  <option value="feedback">Feedback</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="message">Message *</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  placeholder="Tell us more about your inquiry..."
                />
              </div>

              <button type="submit" className="submit-btn">Send Message</button>
            </form>
          </section>

          <section className="content-section">
            <h2>Other Ways to Reach Us</h2>
            <div className="contact-info">
              <div className="info-item">
                <h3>Email</h3>
                <p>support@vitverse.com</p>
              </div>
              <div className="info-item">
                <h3>Phone</h3>
                <p>+91 XXX XXX XXXX</p>
              </div>
              <div className="info-item">
                <h3>Address</h3>
                <p>
                  VIT-Verse Headquarters<br />
                  VIT Campus<br />
                  Vellore, Tamil Nadu 632014
                </p>
              </div>
              <div className="info-item">
                <h3>Business Hours</h3>
                <p>Monday - Friday: 9:00 AM - 6:00 PM IST</p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Contact;
