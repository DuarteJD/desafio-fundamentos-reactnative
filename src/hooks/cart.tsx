import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Product): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const savedProducts = await AsyncStorage.getItem(
        '@GoMarketplace:products',
      );
      if (savedProducts) {
        setProducts(JSON.parse(savedProducts));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const newProducts = [...products];
      const productIndex = products.findIndex(item => item.id === product.id);
      if (productIndex >= 0) {
        newProducts[productIndex] = {
          ...newProducts[productIndex],
          quantity: newProducts[productIndex].quantity += 1,
        };
      } else {
        newProducts.push({ ...product, quantity: 1 });
      }
      setProducts(newProducts);
      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(newProducts),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const productIndex = products.findIndex(product => product.id === id);
      const newProducts = [...products];

      if (productIndex >= 0) {
        newProducts[productIndex] = {
          ...newProducts[productIndex],
          quantity: newProducts[productIndex].quantity += 1,
        };
      }
      setProducts(newProducts);
      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(newProducts),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const productIndex = products.findIndex(product => product.id === id);
      const newProducts = [...products];

      if (productIndex >= 0 && products[productIndex].quantity > 1) {
        newProducts[productIndex] = {
          ...newProducts[productIndex],
          quantity: newProducts[productIndex].quantity -= 1,
        };
      }
      setProducts(newProducts);
      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(newProducts),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
