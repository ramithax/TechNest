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
            <h1>Products</h1>

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