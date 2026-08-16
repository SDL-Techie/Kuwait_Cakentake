import React, { FormEvent, useState } from "react";
import "./Deleteaccount.css";

const Deleteaccount = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Dummy submit for now.
    // Later backend/admin API can be connected here.
    console.log("Account deletion request:", form);

    setSubmitted(true);
  };

  return (
    <div className="deleteAccountPage">
      {/* HERO */}
      <section className="deleteHero">
        <div className="heroGlow heroGlowOne" />
        <div className="heroGlow heroGlowTwo" />

        <div className="pageContainer heroInner">
          <div className="heroBadge">
            <span className="badgeDot" />
            ACCOUNT & PRIVACY
          </div>

          <h1>
            Account Deletion
            <span>Request</span>
          </h1>

          <p>
            You can request permanent deletion of your CakeNTake account and
            associated personal information from here.
          </p>

          <div className="heroNote">
            <span className="heroNoteIcon">i</span>
            <span>
              Please use the same email address and phone number associated
              with your CakeNTake account.
            </span>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <main className="deleteMain">
        <div className="pageContainer deleteGrid">
          {/* LEFT */}
          <section className="privacySection">
            <div className="sectionEyebrow">
              <span />
              BEFORE YOU CONTINUE
            </div>

            <h2>Your privacy is important to us.</h2>

            <p className="sectionDescription">
              When you submit an account deletion request, our team will
              verify your account information before processing the request.
            </p>

            {/* STEPS */}
            <div className="steps">
              <article className="step">
                <div className="stepNumber">01</div>

                <div className="stepContent">
                  <h3>Submit your request</h3>
                  <p>
                    Provide your name, registered email address and phone
                    number using the request form.
                  </p>
                </div>
              </article>

              <article className="step">
                <div className="stepNumber">02</div>

                <div className="stepContent">
                  <h3>Account verification</h3>
                  <p>
                    Our administration team may contact you to confirm that
                    the deletion request belongs to the account owner.
                  </p>
                </div>
              </article>

              <article className="step">
                <div className="stepNumber">03</div>

                <div className="stepContent">
                  <h3>Deletion processing</h3>
                  <p>
                    After verification, eligible account information and
                    associated personal data will be processed for deletion.
                  </p>
                </div>
              </article>
            </div>

            {/* PRIVACY POLICY */}
            <div className="privacyCard">
              <div className="privacyCardTop">
                <div className="privacyIcon">✓</div>

                <div>
                  <span>PRIVACY POLICY</span>
                  <h3>How we handle your data</h3>
                </div>
              </div>

              <p>
                CakeNTake respects your privacy. Information submitted through
                this form will only be used to identify your account, verify
                your request and process the account deletion request.
              </p>

              <p>
                Account information and associated personal information may be
                deleted after verification. Certain records may be retained
                when required for legal, accounting, security, fraud
                prevention or regulatory purposes.
              </p>

              <div className="privacyNotice">
                <span>!</span>

                <p>
                  Account deletion may permanently remove access to your
                  profile, saved addresses and other account-related
                  information.
                </p>
              </div>

              <a className="privacyLink" href="/privacy-policy">
                Read full Privacy Policy
                <span>→</span>
              </a>
            </div>
          </section>

          {/* FORM */}
          <aside className="requestCard">
            {!submitted ? (
              <>
                <div className="requestCardHeader">
                  <div className="formMiniLabel">
                    <span />
                    DELETE MY ACCOUNT
                  </div>

                  <h2>Submit a request</h2>

                  <p>
                    Enter the details associated with your CakeNTake account.
                  </p>
                </div>

                <form className="deleteForm" onSubmit={handleSubmit}>
                  <div className="inputGroup">
                    <label htmlFor="name">Full Name</label>

                    <div className="inputWrapper">
                      <span className="inputIcon">A</span>

                      <input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="Enter your full name"
                        value={form.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="inputGroup">
                    <label htmlFor="email">Email Address</label>

                    <div className="inputWrapper">
                      <span className="inputIcon">@</span>

                      <input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="you@example.com"
                        value={form.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="inputGroup">
                    <label htmlFor="phone">Phone Number</label>

                    <div className="phoneWrapper">
                      <span className="countryCode">+965</span>

                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="XXXX XXXX"
                        value={form.phone}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <small>
                      Enter the number registered with your account.
                    </small>
                  </div>

                  <div className="confirmationBox">
                    <div className="confirmationIcon">!</div>

                    <div>
                      <strong>Please note</strong>
                      <p>
                        Submitting this request starts the account deletion
                        review process.
                      </p>
                    </div>
                  </div>

                  <button className="submitButton" type="submit">
                    <span>Request Account Deletion</span>
                    <span className="buttonArrow">→</span>
                  </button>

                  <p className="secureText">
                    <span>◆</span>
                    Your information is used only to process this request.
                  </p>
                </form>
              </>
            ) : (
              <div className="successState">
                <div className="successCircle">
                  <span>✓</span>
                </div>

                <div className="successLabel">REQUEST RECEIVED</div>

                <h2>Thank you, {form.name}.</h2>

                <p>
                  Your account deletion request has been received. Our
                  administration team will review the provided information.
                </p>

                <div className="successEmail">
                  <span>Request for</span>
                  <strong>{form.email}</strong>
                </div>

                <button
                  type="button"
                  className="backButton"
                  onClick={() => {
                    setSubmitted(false);
                    setForm({
                      name: "",
                      email: "",
                      phone: "",
                    });
                  }}
                >
                  Submit another request
                </button>
              </div>
            )}
          </aside>
        </div>
      </main>

      {/* BOTTOM INFO */}
      <section className="supportSection">
        <div className="pageContainer supportInner">
          <div>
            <span className="supportLabel">NEED ASSISTANCE?</span>

            <h2>We're here to help.</h2>

            <p>
              If you're having trouble accessing your account or submitting a
              request, please contact CakeNTake support.
            </p>
          </div>

          <a href="mailto:support@cakentake.com" className="supportButton">
            Contact Support
            <span>→</span>
          </a>
        </div>
      </section>
    </div>
  );
};

export default Deleteaccount;