import { createContext, useEffect, useState } from "react";


export const StoreContext=createContext(null);

const StoreContextProvider = (props) => {
    const [cartItems, setCartItems] = useState({});
    const [food_list, setFoodList] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [token, setToken] = useState("");
    const [cartReady, setCartReady] = useState(false);
    const url = import.meta.env.VITE_API_URL || "http://localhost:4000";
    const guestCartKey = "guestCart";

    const request = async (path, options = {}) => {
        const response = await fetch(`${url}${path}`, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                ...(token ? { token } : {}),
                ...options.headers,
            },
        });

        return response.json();
    };

    const loadFoodList = async () => {
        const data = await request("/api/food/list");
        if (data.success) {
            setFoodList(data.data);
            return data.data;
        }
        return [];
    }

    const addToCart = async (itemId) => {
        setCartItems((prev) => ({ ...prev, [itemId]: (prev[itemId] || 0) + 1 }))

        if (token) {
            await request("/api/cart/add", {
                method: "POST",
                body: JSON.stringify({ itemId }),
            });
        }
    }

    const removeFromCart = async (itemId) => {
        setCartItems((prev) => ({ ...prev, [itemId]: Math.max((prev[itemId] || 0) - 1, 0) }))

        if (token) {
            await request("/api/cart/remove", {
                method: "POST",
                body: JSON.stringify({ itemId }),
            });
        }
    }

    const getTotalCartAmount = () => {
        let totalAmount = 0;
        for (const item in cartItems) {
            if (cartItems[item] > 0) {
                let itemInfo = food_list.find((product) => product._id === item)
                if (itemInfo) {
                    totalAmount += itemInfo.price * cartItems[item];
                }

            }
        }
        return totalAmount;

    }

    const getTotalCartItems = () => {
        let totalItems = 0;
        for (const item in cartItems) {
            if (cartItems[item] > 0) {
                totalItems += cartItems[item];
            }
        }
        return totalItems;
    }

    const filterCartByFoods = (cartData, foods = food_list) => {
        const validFoodIds = new Set(foods.map((food) => food._id));
        return Object.fromEntries(
            Object.entries(cartData || {}).filter(([itemId]) => validFoodIds.has(itemId))
        );
    }

    const loadCartData = async (authToken, foods = food_list) => {
        const response = await fetch(`${url}/api/cart/get`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                token: authToken,
            },
        });
        const data = await response.json();

        if (data.success) {
            setCartItems(filterCartByFoods(data.cartData || {}, foods));
        }
    }

    const syncGuestCartToServer = async (authToken) => {
        const guestCart = JSON.parse(localStorage.getItem(guestCartKey) || "{}");

        for (const [itemId, quantity] of Object.entries(guestCart)) {
            for (let count = 0; count < quantity; count += 1) {
                await fetch(`${url}/api/cart/add`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        token: authToken,
                    },
                    body: JSON.stringify({ itemId }),
                });
            }
        }

        localStorage.removeItem(guestCartKey);
    }

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem(guestCartKey);
        setToken("");
        setCartItems({});
    }

    const clearCart = () => {
        localStorage.removeItem(guestCartKey);
        setCartItems({});
    }

    useEffect(() => {
        const initializeStore = async () => {
            const foods = await loadFoodList();
            const savedToken = localStorage.getItem("token");

            if (savedToken) {
                setToken(savedToken);
                await loadCartData(savedToken, foods);
            } else {
                const guestCart = JSON.parse(localStorage.getItem(guestCartKey) || "{}");
                setCartItems(filterCartByFoods(guestCart, foods));
            }
            setCartReady(true);
        }

        initializeStore();
    }, [])

    useEffect(() => {
        if (cartReady && !token) {
            localStorage.setItem(guestCartKey, JSON.stringify(cartItems));
        }
    }, [cartItems, cartReady, token])

    const contextValue = {
        url,
        token,
        setToken,
        food_list,
        loadFoodList,
        searchQuery,
        setSearchQuery,
        cartItems,
        setCartItems,
        loadCartData,
        syncGuestCartToServer,
        logout,
        clearCart,
        addToCart,
        removeFromCart, getTotalCartAmount, getTotalCartItems

    }

    return (
        <StoreContext.Provider value={contextValue}>
            {props.children}
        </StoreContext.Provider>
    )
}


export default StoreContextProvider;
