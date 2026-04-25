import React from 'react';
import './Header.css';

const Header = () => {
  const scrollToMenu = () => {
    document.getElementById("explore-menu")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div className="header">
        <div className="header-contents">
            <h2>Order your favorite food here</h2>
            <p>Choose from a diverse menu featuring a delectable array of dishes crafted with the finest ingredients and culinary expertise. Our mission is to satisfy your cravings and elevate your dining experience, one delecious meal at a time.</p>
            <button onClick={scrollToMenu}><p>View Menu</p></button>
        </div>
    </div>
  )
}

export default Header
