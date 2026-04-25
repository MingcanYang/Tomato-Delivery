import React, { useContext, useEffect, useState } from 'react';
import { StoreContext } from '../../context/StoreContext';
import './Orders.css';

const Orders = () => {
  const { token, url } = useContext(StoreContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedCompletedOrders, setExpandedCompletedOrders] = useState({});
  const [activeGroup, setActiveGroup] = useState('in-progress');
  const statusSteps = ['Food Processing', 'Out for delivery', 'Delivered'];

  useEffect(() => {
    const fetchOrders = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${url}/api/order/userorders`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            token,
          },
        });
        const result = await response.json();

        if (result.success) {
          setOrders(result.data || []);
        } else {
          setError(result.message || 'Unable to load your orders.');
        }
      } catch (fetchError) {
        setError('Unable to connect to the server.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [token, url]);

  const formatCurrency = (value) => {
    return typeof value === 'number' ? `$${value.toFixed(2)}` : '$0.00';
  };

  const getStatusTone = (status) => {
    if (status === 'Delivered') return 'success';
    if (status === 'Out for delivery') return 'progress';
    return 'neutral';
  };

  const getPaymentTone = (payment) => payment ? 'success' : 'warning';
  const getStatusStepIndex = (status) => Math.max(statusSteps.indexOf(status), 0);
  const inProgressOrders = orders.filter((order) => (order.status || 'Food Processing') !== 'Delivered');
  const completedOrders = orders.filter((order) => (order.status || 'Food Processing') === 'Delivered');
  const visibleOrders = activeGroup === 'completed' ? completedOrders : inProgressOrders;

  const toggleCompletedOrder = (orderId) => {
    setExpandedCompletedOrders((current) => ({
      ...current,
      [orderId]: !current[orderId],
    }));
  };

  const renderOrderCard = (order, isCompletedSection = false) => {
    const currentStatus = order.status || 'Food Processing';
    const currentStep = getStatusStepIndex(currentStatus);
    const isExpanded = !isCompletedSection || !!expandedCompletedOrders[order._id];

    return (
      <article key={order._id} className={`order-card ${isCompletedSection ? 'order-card-completed' : ''}`}>
        <div className="order-card-top">
          <div className="order-card-identity">
            <span className="order-label">Order ID</span>
            <strong>{order._id.slice(-8).toUpperCase()}</strong>
            <p>{new Date(order.date).toLocaleString()}</p>
          </div>
          <div className="order-card-actions">
            <div className="order-badges">
              <span className={`status-pill ${getPaymentTone(order.payment)}`}>
                {order.payment ? 'Paid' : 'Payment Pending'}
              </span>
            </div>
            {isCompletedSection ? (
              <button
                type="button"
                className="order-toggle-button"
                onClick={() => toggleCompletedOrder(order._id)}
                aria-expanded={isExpanded}
              >
                <p>{isExpanded ? 'Hide details' : 'View details'}</p>
              </button>
            ) : null}
          </div>
        </div>

        <div className="delivery-progress">
          <div className="section-title-row">
            <h2>Delivery status</h2>
          </div>
          <div className="delivery-progress-track" aria-label={`Delivery status: ${currentStatus}`}>
            <div
              className="delivery-progress-line"
              style={{ '--delivery-progress-width': `${currentStep === statusSteps.length - 1 ? 100 : (((currentStep * 2) + 1) / (statusSteps.length * 2)) * 100}%` }}
            />
            {statusSteps.map((step, index) => (
              <div
                key={`${order._id}-${step}`}
                className={`delivery-step ${index < currentStep ? 'completed' : ''} ${index === currentStep ? 'active' : ''} ${currentStep === statusSteps.length - 1 && index === currentStep ? 'final-active' : ''}`}
              >
                <div className="delivery-step-node">{index + 1}</div>
                <div className="delivery-step-copy">
                  <strong>{step}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>

        {isExpanded ? (
          <>
            <div className="order-items">
              <div className="section-title-row">
                <h2>Order breakdown</h2>
                <span>{order.items.reduce((total, item) => total + item.quantity, 0)} items</span>
              </div>
              <ul>
                {order.items.map((item) => (
                  <li key={`${item._id || item.name}-${item.quantity}`}>
                    <div className="order-item-main">
                      <strong>{item.name}</strong>
                      <span>Qty {item.quantity} · {formatCurrency(item.price)} each</span>
                    </div>
                    <div className="order-item-price">{formatCurrency(item.price * item.quantity)}</div>
                  </li>
                ))}
                <li className="order-charge-row">
                  <div className="order-item-main">
                    <strong>Delivery fee</strong>
                  </div>
                  <div className="order-item-price">{formatCurrency(2)}</div>
                </li>
                <li className="order-charge-row order-total-row">
                  <div className="order-item-main">
                    <strong>Total</strong>
                  </div>
                  <div className="order-item-price">{formatCurrency(order.amount)}</div>
                </li>
              </ul>
            </div>

            <div className="order-address">
              <div className="section-title-row">
                <h2>Delivery address</h2>
                {/* <span>{order.address?.phone || 'No phone'}</span> */}
              </div>
              <div className="address-card">
                <p>{order.address?.street || 'N/A'} {order.address?.city || ''} {order.address?.state || ''} {order.address?.zipcode || ''} {order.address?.country || ''}</p>
              </div>
            </div>
          </>
        ) : null}
      </article>
    );
  };

  return (
    <div className="orders-shell">
      <div className="orders-header">
        <p className="orders-kicker">Orders</p>
        <h1>Track your deliveries</h1>
        <p className="orders-description">Review order totals, payment progress, delivery status, and the items in each order.</p>
      </div>

      {!token ? (
        <div className="orders-empty-state">
          <h2>Please sign in</h2>
          <p>You need an account to view your order history.</p>
        </div>
      ) : loading ? (
        <div className="orders-loading">Loading your orders...</div>
      ) : error ? (
        <div className="orders-error">{error}</div>
      ) : orders.length === 0 ? (
        <div className="orders-empty-state">
          <h2>No orders yet</h2>
          <p>Once you place an order, it will appear here.</p>
        </div>
      ) : (
        <div className="orders-groups">
          <div className="orders-filter-bar" role="tablist" aria-label="Order groups">
            <button
              type="button"
              className={`orders-filter-button ${activeGroup === 'in-progress' ? 'active' : ''}`}
              onClick={() => setActiveGroup('in-progress')}
            >
              <p>In progress</p>
              <p>{inProgressOrders.length}</p>
            </button>
            <button
              type="button"
              className={`orders-filter-button ${activeGroup === 'completed' ? 'active' : ''}`}
              onClick={() => setActiveGroup('completed')}
            >
              <p>Completed</p>
              <p>{completedOrders.length}</p>
            </button>
          </div>

          {visibleOrders.length ? (
            <div className="orders-list">
              {visibleOrders.map((order) => renderOrderCard(order, activeGroup === 'completed'))}
            </div>
          ) : (
            <div className="orders-empty-inline">
              {activeGroup === 'completed' ? 'No completed orders yet.' : 'No active deliveries.'}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Orders;
