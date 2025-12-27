import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../../styles/cookie-consent.css';

const CookieConsent: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('cookieConsent');
        if (!consent) {
            // Small delay for smooth entrance
            const timer = setTimeout(() => setIsVisible(true), 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('cookieConsent', 'accepted');
        setIsVisible(false);
    };

    const handleDecline = () => {
        localStorage.setItem('cookieConsent', 'declined');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="cookie-consent-banner">
            <div className="cookie-content">
                <h3>🍪 We use cookies</h3>
                <p>
                    We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic.
                    By clicking "Accept All", you consent to our use of cookies.
                    <Link to="/privacy" className="cookie-link">Learn more</Link>
                </p>
            </div>
            <div className="cookie-actions">
                <button onClick={handleDecline} className="cookie-btn decline">
                    Decline
                </button>
                <button onClick={handleAccept} className="cookie-btn accept">
                    Accept All
                </button>
            </div>
        </div>
    );
};

export default CookieConsent;
