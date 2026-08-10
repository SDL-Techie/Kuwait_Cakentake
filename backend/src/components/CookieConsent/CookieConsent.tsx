import React from "react";
import "./Cookies.css";

const Cookies: React.FC = () => {
  return (
    <div className="cookies-page">
      <div className="cookies-hero">
        <div className="cookies-hero-inner">
          <h1>Cookies Policy</h1>
          <p>
            We use cookies to improve your browsing experience, remember your preferences, and deliver personalized features.
            This page explains how cookies are used and how you can manage your settings.
          </p>
        </div>
      </div>

      <section className="cookies-content">
        <article className="cookies-article">
          <h2>What Are Cookies?</h2>
          <p>
            Cookies are small pieces of text stored on your device when you visit a website. They help our application
            remember your preferences, analyze usage, and provide a smoother experience.
          </p>
        </article>

        <article className="cookies-article">
          <h2>Types of Cookies We Use</h2>
          <ul>
            <li>
              <strong>Essential Cookies:</strong> Required for core site functions such as keeping you logged in and
              processing your cart.
            </li>
            <li>
              <strong>Performance Cookies:</strong> Help us understand how visitors use the site so we can improve speed
              and reliability.
            </li>
            <li>
              <strong>Functional Cookies:</strong> Remember your choices like language, currency, and display preferences.
            </li>
            <li>
              <strong>Marketing Cookies:</strong> Support relevant promotions and help us tailor offers to your interests.
            </li>
          </ul>
        </article>

        <article className="cookies-article">
          <h2>How to Control Cookies</h2>
          <p>
            You can manage cookies through your browser settings. Most browsers allow you to block or delete cookies,
            but disabling cookies may affect certain features of the website.
          </p>
          <p>
            If you'd like a more personalized browsing experience, please keep cookies enabled for this site.
          </p>
        </article>

        <article className="cookies-article">
          <h2>Contact</h2>
          <p>
            If you have questions about our Cookies Policy, please contact our support team via the Contact page.
          </p>
        </article>
      </section>
    </div>
  );
};

export default Cookies;