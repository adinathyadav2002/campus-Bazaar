import React, { useState } from "react";
import AppContext from "./AppContext";
import apiRequest from "../utils/ApiRequest";

export default function AppState(props) {
  const [login, setLogin] = useState(false);
  const [products, setProducts] = useState([]);

  const fetchProducts = async () => {
    try {
      let url = import.meta.env.VITE_BACKEND + "/api/posts/get";
      const { resStatus, data } = await apiRequest(url, "GET", null);
      if (resStatus && data && data.posts.length > 0) {
        setProducts(data.posts);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error("Error at Fetch Products", err);
    }
  };

  return (
    <AppContext.Provider
      value={{ login, setLogin, products, setProducts, fetchProducts }}
    >
      {props.children}
    </AppContext.Provider>
  );
}
