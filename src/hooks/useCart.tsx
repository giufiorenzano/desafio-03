import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
  const storagedCart = localStorage.getItem("@RocketShoes:cart")

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      const productStock = await api.get(`/stock/${productId}`)
      const lastCartUpdate = [...cart]
      const productOnCart = lastCartUpdate.find(product => product.id === productId)
      const amount = productOnCart ? productOnCart.amount : 0
      const desiredAmount = amount + 1

      if (productStock.data.amount < desiredAmount) {
        toast.error('Quantidade solicitada fora de estoque');
        return;
      } 

      if (productOnCart) {
        productOnCart.amount = amount;
      } else {
        const product = await api.get(`/products/${productId}`)
        const productWithAmount = {
          ...product.data,
          amount: 1
        }
        lastCartUpdate.push(productWithAmount)
      }

      setCart(lastCartUpdate)
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(lastCartUpdate))
    } catch {
      toast.error('Erro na adição do produto');
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const lastCartUpdate = [...cart]
      const productOnCart = lastCartUpdate.findIndex(product => product.id === productId)
      

      if(productOnCart >= 0) {
        lastCartUpdate.splice(productOnCart, 1)
        setCart(lastCartUpdate)
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(lastCartUpdate))
      } else {
        throw Error();
      }
    } catch {
      toast.error('Erro na remoção do produto');
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      // TODO
    } catch {
      toast.error('Erro na alteração de quantidade do produto');
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
