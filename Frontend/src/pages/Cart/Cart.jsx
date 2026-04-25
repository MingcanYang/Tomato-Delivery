import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext';
import './Cart.css';

const Cart = () => {
  const { cartItems, addToCart, removeFromCart, food_list,getTotalCartAmount, url} = useContext(StoreContext);
const navigate=useNavigate();
const removeItem = async (itemId) => {
  const quantity = cartItems[itemId] || 0;
  for (let count = 0; count < quantity; count += 1) {
    await removeFromCart(itemId);
  }
}
  return (
    <div className="cart">
      <div className="cart-items">
        <div className="cart-item-title">
          <p>Items</p>
          <p>Title</p>
          <p>Price</p>
          <p>Quantity</p>
          <p>Total</p>
          <p>Remove</p>
        </div>
        <hr />
        <br />
        {food_list.map((item, index) => {
          if (cartItems[item._id] > 0) {
            return (
              <div className="cart-items-item" key={item._id}>
                <img src={`${url}/images/${item.image}`} alt={item.name} />
                <p>{item.name}</p>
                <p>${item.price}</p>
                <div className="cart-quantity-control">
                  <button type="button" onClick={() => removeFromCart(item._id)} aria-label={`Decrease ${item.name}`}><p>-</p></button>
                  <span>{cartItems[item._id]}</span>
                  <button type="button" onClick={() => addToCart(item._id)} aria-label={`Increase ${item.name}`}><p>+</p></button>
                </div>
                <p>${item.price * cartItems[item._id]}</p>
                <button type="button" className='remove-btn' onClick={() => removeItem(item._id)}><p>Remove</p></button>
           
              </div>
              
             
            );
          }
        
          return null;
        })}
      </div>
      <hr/>
      <div className="card-bottom">
        <div className="cart-total">
          <h2>Cart totals</h2>
          <div>
            <div className="cart-total-details">
              <p>Subtotal</p>
              <p>${getTotalCartAmount()}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <p>Delivery Fee</p>
              <p>${getTotalCartAmount()===0?0:2}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <b>Total</b>
              <b>${getTotalCartAmount()===0?0:getTotalCartAmount()+2}</b>
            </div>
           
          </div>
          <button onClick={()=>navigate('/order')}><p>Proceed To Checkout</p></button>
        </div>
        <div className="cart-promocode">
          <div>
            <p>If you have a promo code,Enter it here</p>
          <div className="cart-promocode-input">
            <input type="text" placeholder="Promo Code" />
            <button><p>Submit</p></button>
          </div>
          
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
