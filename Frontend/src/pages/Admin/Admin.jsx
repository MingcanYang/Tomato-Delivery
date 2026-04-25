import React, { useContext, useEffect, useState } from 'react';
import { StoreContext } from '../../context/StoreContext';
import './Admin.css';

const initialFoodForm = {
  name: "",
  description: "",
  price: "",
  category: "Salad",
  image: null,
};

const orderStatuses = ["Food Processing", "Out for delivery", "Delivered"];
const categories = ["Salad", "Rolls", "Deserts", "Sandwich", "Cake", "Pure Veg", "Pasta", "Noodles"];

const Admin = () => {
  const { url } = useContext(StoreContext);
  const [adminToken, setAdminToken] = useState(localStorage.getItem("adminToken") || "");
  const [tokenInput, setTokenInput] = useState(adminToken);
  const [foods, setFoods] = useState([]);
  const [orders, setOrders] = useState([]);
  const [foodForm, setFoodForm] = useState(initialFoodForm);
  const [editingFood, setEditingFood] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("foods");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [foodCategoryFilter, setFoodCategoryFilter] = useState("All");
  const [messages, setMessages] = useState([]);
  const [replyDrafts, setReplyDrafts] = useState({});

  const getAdminHeaders = () => ({
    "admin-token": adminToken,
  });

  const filteredFoods = foodCategoryFilter === "All"
    ? foods
    : foods.filter((food) => food.category === foodCategoryFilter);

  const showMessage = (text) => {
    setMessage(text);
    window.setTimeout(() => setMessage(""), 3000);
  };

  const fetchFoods = async () => {
    const response = await fetch(`${url}/api/food/list`);
    const result = await response.json();
    if (result.success) {
      setFoods(result.data);
    }
  };

  const fetchOrders = async () => {
    if (!adminToken) return;
    const response = await fetch(`${url}/api/order/list`, {
      headers: getAdminHeaders(),
    });
    const result = await response.json();
    if (result.success) {
      setOrders(result.data);
    } else {
      showMessage(result.message);
    }
  };

  const fetchMessages = async () => {
    if (!adminToken) return;
    const response = await fetch(`${url}/api/message/list`, {
      headers: getAdminHeaders(),
    });
    const result = await response.json();
    if (result.success) {
      setMessages(result.data);
    } else {
      showMessage(result.message);
    }
  };

  const updateReplyDraft = (messageId, value) => {
    setReplyDrafts((current) => ({
      ...current,
      [messageId]: value,
    }));
  };

  const submitReply = async (messageId) => {
    if (!adminToken) {
      showMessage("Enter admin token first");
      return;
    }

    const adminReply = (replyDrafts[messageId] || "").trim();
    if (!adminReply) {
      showMessage("Reply content is required");
      return;
    }

    const response = await fetch(`${url}/api/message/reply`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAdminHeaders(),
      },
      body: JSON.stringify({ messageId, adminReply }),
    });
    const result = await response.json();
    showMessage(result.message);
    if (result.success) {
      setReplyDrafts((current) => ({
        ...current,
        [messageId]: "",
      }));
      fetchMessages();
    }
  };

  const refreshAdminData = async () => {
    setLoading(true);
    try {
      await fetchFoods();
      await fetchOrders();
      await fetchMessages();
    } catch (error) {
      showMessage("Could not load admin data");
    } finally {
      setLoading(false);
    }
  };

  const saveToken = (event) => {
    event.preventDefault();
    localStorage.setItem("adminToken", tokenInput);
    setAdminToken(tokenInput);
    showMessage("Admin token saved");
  };

  const clearToken = () => {
    localStorage.removeItem("adminToken");
    setAdminToken("");
    setTokenInput("");
    setOrders([]);
    setMessages([]);
  };

  const onFoodChange = (event) => {
    const { name, value, files } = event.target;
    setFoodForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const resetFoodForm = () => {
    setFoodForm(initialFoodForm);
    setEditingFood(null);
  };

  const startEditingFood = (food) => {
    setEditingFood(food);
    setFoodForm({
      name: food.name,
      description: food.description,
      price: food.price,
      category: food.category,
      image: null,
    });
  };

  const saveFood = async (event) => {
    event.preventDefault();
    if (!adminToken) {
      showMessage("Enter admin token first");
      return;
    }

    const formData = new FormData();
    formData.append("name", foodForm.name);
    formData.append("description", foodForm.description);
    formData.append("price", foodForm.price);
    formData.append("category", foodForm.category);
    if (foodForm.image) {
      formData.append("image", foodForm.image);
    }
    if (editingFood) {
      formData.append("id", editingFood._id);
    }

    const response = await fetch(`${url}/api/food/${editingFood ? "update" : "add"}`, {
      method: "POST",
      headers: getAdminHeaders(),
      body: formData,
    });
    const result = await response.json();
    showMessage(result.message);
    if (result.success) {
      resetFoodForm();
      event.target.reset();
      fetchFoods();
    }
  };

  const removeFood = async (id) => {
    const response = await fetch(`${url}/api/food/remove`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAdminHeaders(),
      },
      body: JSON.stringify({ id }),
    });
    const result = await response.json();
    showMessage(result.message);
    if (result.success) {
      fetchFoods();
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    const response = await fetch(`${url}/api/order/status`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAdminHeaders(),
      },
      body: JSON.stringify({ orderId, status }),
    });
    const result = await response.json();
    showMessage(result.message);
    if (result.success) {
      fetchOrders();
    }
  };

  useEffect(() => {
    refreshAdminData();
  }, [adminToken]);

  return (
    <div className={sidebarCollapsed ? "admin-shell collapsed" : "admin-shell"}>
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <span>T</span>
          <div className="admin-brand-copy">
            <strong>Tomato</strong>
            <p>Admin</p>
          </div>
        </div>
        <button className={activeTab === "foods" ? "active" : ""} onClick={() => setActiveTab("foods")}>
          <span>F</span>
          <p className="nav-label">Foods</p>
        </button>
        <button className={activeTab === "orders" ? "active" : ""} onClick={() => setActiveTab("orders")}>
          <span>O</span>
          <p className="nav-label">Orders</p>
        </button>
        <button className={activeTab === "messages" ? "active" : ""} onClick={() => setActiveTab("messages") }>
          <span>M</span>
          <p className="nav-label">Messages</p>
        </button>
        <button
          type="button"
          className="sidebar-toggle"
          onClick={() => setSidebarCollapsed((prev) => !prev)}
        >
          <span>{sidebarCollapsed ? ">" : "<"}</span>
          <p className="nav-label">{sidebarCollapsed ? "Expand" : "Collapse"}</p>
        </button>
      </aside>

      <main className="admin-page">
        <div className="admin-header">
          <div>
            <p className="admin-kicker">Control Panel</p>
            <h1>Restaurant operations</h1>
          </div>
          <form className="admin-token-form" onSubmit={saveToken}>
            <input
              type="password"
              placeholder="Admin token"
              value={tokenInput}
              onChange={(event) => setTokenInput(event.target.value)}
            />
            <button type="submit"><p>Save</p></button>
            {adminToken && <button type="button" className="ghost-btn" onClick={clearToken}><p>Logout</p></button>}
          </form>
        </div>

        {message && <div className="admin-message">{message}</div>}

        <div className="admin-toolbar">
          <button className="refresh-btn" onClick={refreshAdminData} disabled={loading}>
            <span className={loading ? "refresh-icon spinning" : "refresh-icon"}>↻</span>
            <p>{loading ? "Refreshing" : "Refresh"}</p>
          </button>
        </div>

        {activeTab === "foods" && (
        <div className="admin-grid">
          <form className="admin-panel" onSubmit={saveFood}>
            <div className="admin-panel-heading">
              <h2>{editingFood ? "Edit food" : "Add food"}</h2>
              {editingFood && <button type="button" className="ghost-btn compact-btn" onClick={resetFoodForm}><p>Cancel</p></button>}
            </div>
            <input name="name" value={foodForm.name} onChange={onFoodChange} placeholder="Name" required />
            <textarea name="description" value={foodForm.description} onChange={onFoodChange} placeholder="Description" required />
            <div className="admin-row">
              <input name="price" value={foodForm.price} onChange={onFoodChange} type="number" min="0.01" step="0.01" placeholder="Price" required />
              <select name="category" value={foodForm.category} onChange={onFoodChange}>
                {categories.map((category) => <option key={category} value={category}>{category}</option>)}
              </select>
            </div>
            <input name="image" onChange={onFoodChange} type="file" accept="image/*" required={!editingFood} />
            {editingFood && <p className="form-hint">Leave image empty to keep the current photo.</p>}
            <button type="submit"><p>{editingFood ? "Save changes" : "Add food"}</p></button>
          </form>

          <div className="admin-panel">
            <div className="admin-panel-heading">
              <h2>Food list</h2>
              <span>{filteredFoods.length} items</span>
            </div>
            <div className="food-category-filter">
              {["All", ...categories].map((category) => (
                <button
                  type="button"
                  key={category}
                  className={foodCategoryFilter === category ? "active" : ""}
                  onClick={() => setFoodCategoryFilter(category)}
                >
                  <p>{category}</p>
                </button>
              ))}
            </div>
            <div className="admin-list scroll-list">
              {filteredFoods.map((food) => (
                <div className="food-admin-item" key={food._id}>
                  <img src={`${url}/images/${food.image}`} alt={food.name} />
                  <div>
                    <strong>{food.name}</strong>
                    <p>{food.category} · ${food.price}</p>
                  </div>
                  <button type="button" className="edit-icon-btn" aria-label={`Edit ${food.name}`} title="Edit" onClick={() => startEditingFood(food)}>
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M4 20h4l10.5-10.5-4-4L4 16v4Z" />
                      <path d="M13.5 6.5l4 4" />
                    </svg>
                  </button>
                  <button type="button" className="danger-btn" onClick={() => removeFood(food._id)}><p>Remove</p></button>
                </div>
              ))}
              {filteredFoods.length === 0 && <p className="empty-state">No foods found.</p>}
            </div>
          </div>
        </div>
        )}

        {activeTab === "orders" && (
        <div className="admin-panel">
          <h2>Orders</h2>
          {!adminToken && <p className="empty-state">Enter admin token to load orders.</p>}
          <div className="orders-list">
            {orders.map((order) => (
              <div className="order-admin-item" key={order._id}>
                <div>
                  <strong>{order.address?.firstName} {order.address?.lastName}</strong>
                  <p>{order.address?.street}, {order.address?.city}, {order.address?.state}</p>
                  <p>{order.items.map((item) => `${item.name} x${item.quantity}`).join(", ")}</p>
                </div>
                <div>
                  <strong>${order.amount}</strong>
                  <p>{order.payment ? "Paid" : "Unpaid"}</p>
                </div>
                <select value={order.status} onChange={(event) => updateOrderStatus(order._id, event.target.value)}>
                  {orderStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
              </div>
            ))}
            {orders.length === 0 && <p className="empty-state">No orders found.</p>}
          </div>
        </div>
        )}

        {activeTab === "messages" && (
        <div className="admin-panel">
          <h2>Messages</h2>
          {!adminToken && <p className="empty-state">Enter admin token to load messages.</p>}
          <div className="messages-list">
            {messages.map((messageItem) => (
              <div className="message-admin-item" key={messageItem._id}>
                <div className="message-admin-main">
                  <div className="message-admin-head">
                    <div className="message-sender">
                      <strong>{messageItem.name}</strong>
                      <p>{messageItem.email}</p>
                    </div>
                    <span className="message-date">{new Date(messageItem.date).toLocaleString()}</span>
                  </div>
                  <div className="message-body-card">
                    <span className="message-label">Customer message</span>
                    <p className="message-text">{messageItem.message}</p>
                  </div>
                  {messageItem.adminReply ? (
                    <div className="message-reply-block">
                      <span className="reply-label">Reply sent</span>
                      <p>{messageItem.adminReply}</p>
                      <span>{messageItem.repliedAt ? new Date(messageItem.repliedAt).toLocaleString() : ""}</span>
                    </div>
                  ) : null}
                </div>
                <div className="message-admin-side">
                  <span className="message-compose-label">Reply</span>
                  <textarea
                    placeholder="Write a reply to the customer"
                    value={replyDrafts[messageItem._id] ?? ""}
                    onChange={(event) => updateReplyDraft(messageItem._id, event.target.value)}
                  />
                  <button type="button" onClick={() => submitReply(messageItem._id)}>
                    <p>Reply</p>
                  </button>
                </div>
              </div>
            ))}
            {messages.length === 0 && <p className="empty-state">No messages found.</p>}
          </div>
        </div>
        )}
      </main>
    </div>
  )
}

export default Admin;
