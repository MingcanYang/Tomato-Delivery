import React, { useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Footer from './components/Footer/Footer';
import LoginPopup from './components/LoginPopup/LoginPopup';
import Navbar from './components/Navbar/Navbar.jsx';
import Cart from './pages/Cart/Cart';
import Admin from './pages/Admin/Admin';
import Contact from './pages/Contact/Contact';
import Home from './pages/Home/Home';
import Order from './pages/PlaceOrder/Order';
import Profile from './pages/Profile/Profile';
import Orders from './pages/Orders/Orders';
import Verify from './pages/Verify/Verify';

const App = () => {
  //display popup for login
  const [showLogin,setShowLogin]=useState(false);
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith("/admin");

  return (
    <>
    {!isAdminPage && showLogin?<LoginPopup setShowLogin={setShowLogin}/>:<></>}
    <div className={isAdminPage ? 'admin-app' : 'app'}>
      {!isAdminPage && <Navbar setShowLogin={setShowLogin}/>}
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/cart" element={<Cart/>}/>
        <Route path ="/order" element={<Order/>}/>
        <Route path="/orders" element={<Orders/>}/>
        <Route path="/profile" element={<Profile/>}/>
        <Route path="/contact" element={<Contact/>}/>
        <Route path="/verify" element={<Verify/>}/>
        <Route path="/admin" element={<Admin/>}/>
        <Route path="*" element={<Home/>}/>
      </Routes>
      
    </div>
    {!isAdminPage && <Footer/>}
    </>
  )
}

export default App
