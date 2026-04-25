import React, { useContext, useState } from 'react';
import { StoreContext } from '../../context/StoreContext';
import './Contact.css';

const Contact = () => {
  const { url } = useContext(StoreContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');

  const submitMessage = async (event) => {
    event.preventDefault();
    setStatus('sending');

    try {
      const response = await fetch(`${url}/api/message/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, message }),
      });
      const result = await response.json();

      if (result.success) {
        setStatus('sent');
        setName('');
        setEmail('');
        setMessage('');
      } else {
        setStatus(result.message || 'Failed to send message.');
      }
    } catch (error) {
      setStatus('Could not connect to the server.');
    }
  };

  return (
    <div className="contact-shell">
      <div className="contact-header">
        <p className="contact-kicker">Contact Us</p>
        <h1>Support that stays practical</h1>
        <p className="contact-description">
          Reach support for delivery issues, billing questions, account help, or restaurant feedback. The page is structured to get users to the right channel fast instead of forcing everything through one generic form.
        </p>
      </div>

      <div className="contact-help-section">
        <div className="contact-card contact-help-card">
          <div className="contact-card-head">
            <h2>What helps us resolve faster</h2>
          </div>
          <ul className="contact-checklist">
            <li>Order number or delivery time</li>
            <li>Phone or email used for the order</li>
            <li>Clear description of what went wrong</li>
            <li>Receipt or screenshot if billing is involved</li>
          </ul>
        </div>
      </div>

      <div className="contact-grid">
        <div className="contact-info-panel">
          <div className="contact-card contact-primary-card">
            <div className="contact-card-head">
              <h2>Customer support</h2>
            </div>
            <div className="contact-channel-list">
              <div className="contact-channel">
                <span className="contact-channel-label">Email</span>
                <strong>support@tomato-delivery.com</strong>
                <p>Best for refund requests, receipt issues, and order follow-up.</p>
              </div>
              <div className="contact-channel">
                <span className="contact-channel-label">Phone</span>
                <strong>+61 000 000 000</strong>
                <p>Use for active delivery issues that need immediate action.</p>
              </div>
            </div>
          </div>

          <div className="contact-card contact-meta-grid">
            <div className="contact-meta-card">
              <span>Response time</span>
              <strong>Within 30 min</strong>
              <p>Typical reply window during support hours.</p>
            </div>
            <div className="contact-meta-card">
              <span>Support hours</span>
              <strong>08:00 - 22:00</strong>
              <p>Seven days a week for order-related cases.</p>
            </div>
          </div>
        </div>

        <div className="contact-card contact-form-card">
          <div className="contact-card-head">
            <h2>Send a message</h2>
            <p>Share the order details and the issue clearly so support can act on it without extra back-and-forth.</p>
          </div>
          <form onSubmit={submitMessage}>
            <label>
              Name
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </label>
            <label>
              Email
              <input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </label>
            <label>
              Message
              <textarea
                placeholder="Tell us what happened, what order it affected, and what outcome you need."
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                required
              />
            </label>
            <button type="submit" disabled={status === 'sending'}>
              <p>{status === 'sending' ? 'Sending...' : 'Submit request'}</p>
            </button>
            {status && (
              <p className={`contact-status ${status === 'sent' ? 'success' : status === 'sending' ? '' : 'error'}`}>
                {status === 'sending' ? 'Sending message...' : status === 'sent' ? 'Message sent successfully.' : status}
              </p>
            )}
          </form>
        </div>
      </div>

      <div className="contact-map-section">
        <div className="contact-card contact-map-card">
          <div className="contact-card-head">
            <h2>Restaurant location</h2>
            <p>Northfields Ave, Wollongong NSW 2522, Australia</p>
          </div>
          <div className="contact-map-frame">
            <iframe
              title="Tomato Delivery restaurant location map"
              src="https://www.openstreetmap.org/export/embed.html?bbox=150.8760%2C-34.4090%2C150.8850%2C-34.4010&layer=mapnik&marker=-34.4050%2C150.8790"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <a
            className="contact-map-link"
            href="https://www.openstreetmap.org/?mlat=-34.4050&mlon=150.8790#map=17/-34.4050/150.8790"
            target="_blank"
            rel="noreferrer"
          >
            Open full map
          </a>
        </div>
      </div>
    </div>
  );
};

export default Contact;
