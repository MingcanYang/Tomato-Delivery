import React, { useContext } from 'react';
import { assets, menu_list } from '../../assets/assets';
import { StoreContext } from '../../context/StoreContext';
import './Menu.css';

const Menu = ({ category, setCategory }) => {
  const { searchQuery, setSearchQuery } = useContext(StoreContext);

  return (
    <div className="explore-menu" id="explore-menu">
      <h1>Explore our menu</h1>
      <p className='explore-menu-text'>Choose from a diverse menu featuring a delectable array of dishes crafted with the finest ingredients and culinary expertise.</p>
      <div className="explore-menu-list">
        {menu_list.map((item, index) => {
          return (
            <div onClick={() => setCategory(prev => prev === item.menu_name ? "All" : item.menu_name)} key={index} className="explore-menu-list-item">
              <img className={category === item.menu_name ? "active" : ""} src={item.menu_image} alt="" />
              <p>{item.menu_name}</p>
            </div>

          )
        })}
      </div>
      <div className="menu-search">
        <img src={assets.search_icon} alt="" />
        <input
          type="search"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search dishes by name, category, or description"
        />
      </div>
      <hr></hr>
    </div>
  )
}

export default Menu
