import { useEffect, useState } from "react";
import api from "../lib/axios";

function ProductPage() {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        const getProducts = async () => {
            try {
                const response = await api.get("/product");
                setProducts(response.data);
            } catch (error) {
                console.error("Failed to fetch products:", error);
            }
        };

        getProducts();
    }, []);

    return (
        <div>

            <p className="text-white text-2xl font-semibold text-center m-10">Products Page</p>

            {products.map((product) => (
                <div key={product.id}>
                    <h2>{product.name}</h2>
                    <p>{product.price}</p>
                </div>
            ))}
        </div>
    );
}

export { ProductPage }