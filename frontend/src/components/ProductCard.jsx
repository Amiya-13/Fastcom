import './ProductCard.css';

const ProductCard = ({ product, onAddToCart, showActions = true }) => {
    const imageUrl = product.images?.[0] || 'https://via.placeholder.com/400';

    return (
        <div className="product-card glass-card">
            <div className="product-image-container">
                <img src={imageUrl} alt={product.name} className="product-image" />
                <span className="product-category badge badge-primary">{product.category}</span>
                {product.stock === 0 && <span className="out-of-stock">Out of Stock</span>}
            </div>

            <div className="product-info">
                <h3 className="product-name">{product.name}</h3>
                <p className="product-shop">🏪 {product.shopName}</p>
                <p className="product-description">{product.description}</p>

                <div className="product-footer flex-between">
                    <div className="product-price">
                        <span className="price-label">Price:</span>
                        <span className="price-value text-gradient">₹{product.price}</span>
                    </div>

                    {showActions && (
                        <button
                            className="btn btn-primary btn-sm"
                            onClick={() => onAddToCart(product)}
                            disabled={product.stock === 0}
                        >
                            {product.stock === 0 ? 'Unavailable' : 'Add to Cart'}
                        </button>
                    )}
                </div>

                <div className="product-stock">
                    <span className={product.stock > 10 ? 'text-success' : 'text-warning'}>
                        {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
