import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare, CheckCircle, AlertCircle } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import './Contact.css';

const Contact = () => {
  const { settings } = useSettings();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await axios.post(`${API_BASE_URL}/contact`, formData);

      if (response.data.success) {
        setSubmitStatus({ type: 'success', message: 'Thank you for your message! We will get back to you soon.' });
        setFormData({
          name: '',
          email: '',
          phone: '',
          message: ''
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setSubmitStatus({
        type: 'error',
        message: 'Sorry, there was an error sending your message. Please try again or contact us directly via email.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-page">
      <div className="contact-hero">
        <div className="container">
          <h1>Contact us</h1>
          <p>We are here to help you with any questions or concerns you may have.</p>
        </div>
      </div>

      <div className="container">
        <div className="contact-content">
          <div className="contact-info">
            <div className="info-card">
              <div className="info-icon">
                <Mail size={24} />
              </div>
              <h3>Email Us</h3>
              <p>Send us an email anytime</p>
              <a href={`mailto:${settings.contactEmail}`} className="contact-link">
                {settings.contactEmail}
              </a>
            </div>

            <div className="info-card">
              <div className="info-icon">
                <Phone size={24} />
              </div>
              <h3>Call Us</h3>
              <p>Mon - Sat, 9:00 AM - 6:00 PM</p>
              <a href={`tel:${settings.phone}`} className="contact-link">
                {settings.phone}
              </a>
            </div>

            <div className="info-card">
              <div className="info-icon">
                <MessageSquare size={24} />
              </div>
              <h3>Owner Contact</h3>
              <p>Abdullah</p>
              <div className="owner-details">
                <a href={`mailto:${settings.contactEmail}`} className="contact-link">
                  {settings.contactEmail}
                </a>
                <a href={`tel:${settings.phone}`} className="contact-link">
                  {settings.phone}
                </a>
              </div>
            </div>
          </div>

          <div className="contact-form-wrapper">
            <div className="contact-form-card">
              {submitStatus?.type === 'success' ? (
                <div className="success-screen" style={{ textAlign: 'center', padding: '40px 20px' }}>
                  <div style={{ color: '#008060', marginBottom: '20px' }}>
                    <CheckCircle size={64} />
                  </div>
                  <h2 style={{ fontSize: '2rem', marginBottom: '15px', color: '#202223' }}>Thank You!</h2>
                  <p style={{ fontSize: '1.1rem', color: '#666', lineHeight: '1.6', maxWidth: '400px', margin: '0 auto 30px' }}>
                    Your message has been sent successfully. We appreciate you reaching out and will get back to you as soon as possible.
                  </p>
                  <button
                    onClick={() => setSubmitStatus(null)}
                    className="btn btn-primary"
                    style={{ padding: '12px 30px' }}
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <>
                  <h2>Begin a Dialogue</h2>
                  <p>Complete the details below, and a member of our private client team will respond within 24 hours.</p>

                  <form onSubmit={handleSubmit} className="contact-form">
                    <div className="form-group">
                      <label htmlFor="name">Your Name</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="Enter your name"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="email">Your Email</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="Enter your email"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="phone">Phone Number</label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Enter your phone number"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="message">Message</label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows="5"
                        placeholder="Enter your message..."
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary btn-submit"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="spinner-small"></div>
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send size={20} />
                          Send Message
                        </>
                      )}
                    </button>

                    {submitStatus?.type === 'error' && (
                      <div className="submit-message error" style={{ marginTop: '20px' }}>
                        <AlertCircle size={20} />
                        <span>{submitStatus.message}</span>
                      </div>
                    )}
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
