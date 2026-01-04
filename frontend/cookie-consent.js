/**
 * Cookie Consent Banner - GDPR/CCPA Compliant
 * Manages user consent for cookies and analytics
 */

(function() {
    'use strict';

    const CONSENT_KEY = 'cookieConsent';
    const ANALYTICS_ENABLED_KEY = 'analyticsEnabled';

    // Check if consent has been given
    function hasConsent() {
        return localStorage.getItem(CONSENT_KEY) !== null;
    }

    // Check if analytics is enabled
    function isAnalyticsEnabled() {
        return localStorage.getItem(ANALYTICS_ENABLED_KEY) === 'true';
    }

    // Set consent
    function setConsent(analyticsEnabled) {
        localStorage.setItem(CONSENT_KEY, 'true');
        localStorage.setItem(ANALYTICS_ENABLED_KEY, analyticsEnabled.toString());
        
        if (analyticsEnabled) {
            enableAnalytics();
        }
    }

    // Enable Google Analytics
    function enableAnalytics() {
        // Check if gtag is available
        if (typeof gtag !== 'undefined') {
            gtag('consent', 'update', {
                'analytics_storage': 'granted'
            });
        }
    }

    // Create and show consent banner
    function showConsentBanner() {
        if (hasConsent()) {
            if (isAnalyticsEnabled()) {
                enableAnalytics();
            }
            return;
        }

        const banner = document.createElement('div');
        banner.id = 'cookieConsentBanner';
        banner.innerHTML = `
            <div class="cookie-consent-overlay"></div>
            <div class="cookie-consent-banner">
                <div class="cookie-consent-content">
                    <h3>🍪 Cookie Preferences</h3>
                    <p>We use cookies to improve your experience. Essential cookies are required for the app to function. Analytics cookies help us improve our service.</p>
                    
                    <div class="cookie-options">
                        <div class="cookie-option">
                            <input type="checkbox" id="essentialCookies" checked disabled>
                            <label for="essentialCookies">
                                <strong>Essential Cookies</strong>
                                <span class="cookie-desc">Required for authentication and core features</span>
                            </label>
                        </div>
                        <div class="cookie-option">
                            <input type="checkbox" id="analyticsCookies" checked>
                            <label for="analyticsCookies">
                                <strong>Analytics Cookies</strong>
                                <span class="cookie-desc">Help us understand how you use the app (Google Analytics)</span>
                            </label>
                        </div>
                    </div>

                    <div class="cookie-buttons">
                        <button id="acceptAllCookies" class="btn btn-primary">
                            ✓ Accept All
                        </button>
                        <button id="acceptEssentialOnly" class="btn btn-secondary">
                            Essential Only
                        </button>
                    </div>

                    <p class="cookie-links">
                        <a href="privacy-policy.html" target="_blank">Privacy Policy</a> | 
                        <a href="cookie-policy.html" target="_blank">Cookie Policy</a>
                    </p>
                </div>
            </div>
        `;

        document.body.appendChild(banner);

        // Add event listeners
        document.getElementById('acceptAllCookies').addEventListener('click', function() {
            setConsent(true);
            removeBanner();
        });

        document.getElementById('acceptEssentialOnly').addEventListener('click', function() {
            setConsent(false);
            removeBanner();
        });

        // Animate in
        setTimeout(() => {
            banner.classList.add('show');
        }, 100);
    }

    // Remove banner
    function removeBanner() {
        const banner = document.getElementById('cookieConsentBanner');
        if (banner) {
            banner.classList.remove('show');
            setTimeout(() => {
                banner.remove();
            }, 300);
        }
    }

    // Add styles
    function addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            #cookieConsentBanner {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 999999;
                display: flex;
                align-items: flex-end;
                justify-content: center;
                pointer-events: none;
                opacity: 0;
                transition: opacity 0.3s ease;
            }

            #cookieConsentBanner.show {
                opacity: 1;
                pointer-events: all;
            }

            .cookie-consent-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                backdrop-filter: blur(4px);
            }

            .cookie-consent-banner {
                position: relative;
                max-width: 600px;
                width: 90%;
                background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                border: 1px solid rgba(102, 126, 234, 0.3);
                border-radius: 16px 16px 0 0;
                padding: 2rem;
                box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.3);
                margin-bottom: 0;
            }

            .cookie-consent-content h3 {
                margin: 0 0 1rem 0;
                color: #ffffff;
                font-size: 1.5rem;
            }

            .cookie-consent-content p {
                color: rgba(255, 255, 255, 0.8);
                line-height: 1.6;
                margin-bottom: 1.5rem;
            }

            .cookie-options {
                margin: 1.5rem 0;
            }

            .cookie-option {
                display: flex;
                align-items: flex-start;
                gap: 0.75rem;
                margin-bottom: 1rem;
                padding: 1rem;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 8px;
                border: 1px solid rgba(255, 255, 255, 0.1);
            }

            .cookie-option input[type="checkbox"] {
                margin-top: 0.25rem;
                width: 18px;
                height: 18px;
                cursor: pointer;
            }

            .cookie-option input[type="checkbox"]:disabled {
                cursor: not-allowed;
                opacity: 0.6;
            }

            .cookie-option label {
                flex: 1;
                cursor: pointer;
            }

            .cookie-option label strong {
                display: block;
                color: #ffffff;
                margin-bottom: 0.25rem;
            }

            .cookie-desc {
                display: block;
                font-size: 0.85rem;
                color: rgba(255, 255, 255, 0.6);
            }

            .cookie-buttons {
                display: flex;
                gap: 1rem;
                margin: 1.5rem 0 1rem 0;
            }

            .cookie-buttons .btn {
                flex: 1;
                padding: 0.875rem 1.5rem;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
                border: none;
                transition: all 0.3s ease;
                font-size: 1rem;
            }

            .cookie-buttons .btn-primary {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
            }

            .cookie-buttons .btn-primary:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);
            }

            .cookie-buttons .btn-secondary {
                background: rgba(255, 255, 255, 0.1);
                color: white;
                border: 1px solid rgba(255, 255, 255, 0.2);
            }

            .cookie-buttons .btn-secondary:hover {
                background: rgba(255, 255, 255, 0.15);
            }

            .cookie-links {
                text-align: center;
                font-size: 0.85rem;
                margin: 1rem 0 0 0;
            }

            .cookie-links a {
                color: #667eea;
                text-decoration: none;
            }

            .cookie-links a:hover {
                text-decoration: underline;
            }

            @media (max-width: 640px) {
                .cookie-consent-banner {
                    width: 100%;
                    padding: 1.5rem;
                    border-radius: 0;
                }

                .cookie-buttons {
                    flex-direction: column;
                }

                .cookie-consent-content h3 {
                    font-size: 1.25rem;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // Initialize on page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            addStyles();
            showConsentBanner();
        });
    } else {
        addStyles();
        showConsentBanner();
    }

    // Export functions for settings page
    window.CookieConsent = {
        hasConsent: hasConsent,
        isAnalyticsEnabled: isAnalyticsEnabled,
        setConsent: setConsent,
        showPreferences: showConsentBanner
    };
})();
