import "./PrivacyPolicy.css";

export default function PrivacyPolicy() {
  return (
    <div className="pp-root">
      {/* Hero */}
      <header className="pp-hero">
        <div className="pp-hero-badge">Legal</div>
        <h1 className="pp-hero-title">Privacy Policy</h1>
        <p className="pp-hero-subtitle">
          Please read this policy carefully to understand how we handle your data.
        </p>
        <div className="pp-hero-meta">
          <span>Last Updated: October 2023</span>
        </div>
      </header>

      {/* Single content card */}
      <div className="pp-layout">
        <main className="pp-main">
          <div className="pp-card">
            <section className="pp-section">
              <h2 className="pp-section-title">1. Information We Collect</h2>
              <div className="pp-section-body">
                <p>
                  We collect information you provide directly to us when you create an account,
                  place an order, or contact us. This may include your name, email address, phone
                  number, and delivery address.
                </p>
              </div>
            </section>

            <section className="pp-section">
              <h2 className="pp-section-title">2. How We Use Your Information</h2>
              <div className="pp-section-body">
                <p>
                  We use the information we collect to process your orders, communicate with you
                  about your account, and send you updates about our products and services (if
                  you opt-in).
                </p>
              </div>
            </section>

            <section className="pp-section">
              <h2 className="pp-section-title">3. Data Security</h2>
              <div className="pp-section-body">
                <p>
                  We implement a variety of security measures to maintain the safety of your
                  personal information. Your personal information is contained behind secured
                  networks and is only accessible by a limited number of persons.
                </p>
              </div>
            </section>

            <section className="pp-section pp-section--last">
              <h2 className="pp-section-title">4. Cookies</h2>
              <div className="pp-section-body">
                <p>
                  We use cookies to help us remember and process the items in your shopping cart
                  and understand and save your preferences for future visits.
                </p>
              </div>
            </section>
          </div>
        </main>
      </div>

    </div>
  );
}