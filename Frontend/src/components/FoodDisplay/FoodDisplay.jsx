import React, { useContext } from 'react';
import { StoreContext } from '../../context/StoreContext';
import FoodItem from '../FoodItem/FoodItem';
import './FoodDisplay.css';

const FoodDisplay = ({ category }) => {
  const { food_list, searchQuery } = useContext(StoreContext)
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredFoodList = food_list.filter((item) => {
    const matchesCategory = category === "All" || category === item.category;
    const matchesSearch = !normalizedQuery
      || item.name.toLowerCase().includes(normalizedQuery)
      || item.description.toLowerCase().includes(normalizedQuery)
      || item.category.toLowerCase().includes(normalizedQuery);

    return matchesCategory && matchesSearch;
  });

  return (
    <div className='food-display' id='food-display'>
      <h2>{searchQuery ? `Search results for "${searchQuery}"` : "Top dishes near to you"}</h2>
      <div className={searchQuery ? "food-display-list search-results-list" : "food-display-list"}>
        {filteredFoodList.map((item, index) => (
          <FoodItem key={item._id || index} id={item._id} name={item.name}
            description={item.description} price={item.price} image={item.image} />
        ))}
      </div>
      {food_list.length === 0 && <p className="food-display-empty">No dishes available.</p>}
      {food_list.length > 0 && filteredFoodList.length === 0 && <p className="food-display-empty">No dishes match your search.</p>}
    </div>
  )
}


export default FoodDisplay
