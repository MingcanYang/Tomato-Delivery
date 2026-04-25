import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext';
import { assets } from '../../assets/assets';
import './Navbar.css';

const Navbar = ({ setShowLogin }) => {
  const location = useLocation();
  const { getTotalCartItems, token } = useContext(StoreContext);
  const totalCartItems = getTotalCartItems();

  const getMenuClass = (path) => {
    return location.pathname === path ? "active" : "";
  };

  return (
    <div className='navbar'>
      <Link to='/' ><img src={assets.logo} alt="" className="log" /></Link>
      <ul className="navbar-menu">
        <Link to="/" className={getMenuClass("/")}> menu</Link>
        <Link to="/orders" className={getMenuClass("/orders")}> orders</Link>
        <Link to="/contact" className={getMenuClass("/contact")}> contact us</Link>
      </ul>
      <div className="navbar-right">
        <div className="navbar-search-icon">
          <Link to='/cart'><img src={assets.basket_icon} alt="" /></Link>
          {totalCartItems > 0 && <div className="dot">{totalCartItems}</div>}
        </div>
        {!token ? (
          <button onClick={() => setShowLogin(true)}><p>sign in</p></button>
        ) : (
          <Link to="/profile" className="navbar-profile-button" aria-label="Go to profile">
            <img src={assets.profile_icon} alt="" />
          </Link>
        )}
      </div>
    </div>
  )
}

export default Navbar
