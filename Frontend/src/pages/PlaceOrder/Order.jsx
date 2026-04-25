import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext';
import './PlaceOrder.css';

const PlaceOrder = () => {
  const { getTotalCartAmount, food_list, cartItems, token, url } = useContext(StoreContext)
  const navigate = useNavigate();
  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
    phone: "",
  });

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setData((prev) => ({ ...prev, [name]: value }));
  }

  const placeOrder = async (event) => {
    event.preventDefault();

    if (!token) {
      alert("Please login before placing an order");
      return;
    }

    const orderItems = food_list
      .filter((item) => cartItems[item._id] > 0)
      .map((item) => ({ ...item, quantity: cartItems[item._id] }));

    if (orderItems.length === 0) {
      navigate("/cart");
      return;
    }

    const orderData = {
      address: data,
      items: orderItems,
      amount: getTotalCartAmount() + 2,
    };

    const response = await fetch(`${url}/api/order/place`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        token,
      },
      body: JSON.stringify(orderData),
    });
    const result = await response.json();

    if (result.success) {
      window.location.replace(result.session_url);
    } else {
      alert(result.message);
    }
  }

  return (
    <form onSubmit={placeOrder} className='place-order'>
     <div className="place-oredr-left">
<p className="title">Delivery Information</p>
<div className="multi-field">
  <input name="firstName" onChange={onChangeHandler} value={data.firstName} type="text" placeholder='First Name' required/>
  <input name="lastName" onChange={onChangeHandler} value={data.lastName} type="text" placeholder='Last Name' required/>
</div>
<input name="email" onChange={onChangeHandler} value={data.email} type="email" placeholder='Email address' required/>
<input name="street" onChange={onChangeHandler} value={data.street} type="text" placeholder='street' required/>

     
     <div className="multi-field">
  <input name="city" onChange={onChangeHandler} value={data.city} type="text" placeholder='City' required/>
  <input name="state" onChange={onChangeHandler} value={data.state} type="text" placeholder='State' required/>

</div>
   
     <div className="multi-field">
  <input name="zipcode" onChange={onChangeHandler} value={data.zipcode} type="text" placeholder='Zip code' required/>
  <input name="country" onChange={onChangeHandler} value={data.country} type="text" placeholder='Country' required/>


     </div>

<input name="phone" onChange={onChangeHandler} value={data.phone} type="text" placeholder='Phone' required />
</div>

<div className="palce-order-right">
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
          <button type="submit"><p>Proceed To Payment</p></button>
        </div>
       
        </div>
    

    </form>
  )
}

export default PlaceOrder
