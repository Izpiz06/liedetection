import { useEffect, useState } from 'react';
import { productsAPI } from '../services/api';
import ProductCard from '../components/ProductCard';
import SearchBar from '../components/SearchBar';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    productsAPI.getAll({ search, category })
      .then(res => {
        setProducts(res.data.data.products);
        setCategories(res.data.data.categories || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [search, category]);

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-3xl font-black">Product Explorer</h1>
        <p className="text-sm opacity-60 font-bold">Browse products and their trust scores</p>
      </div>

      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Search products or brands..."
        filters={categories}
        activeFilter={category}
        onFilterChange={setCategory}
      />

      {loading ? (
        <LoadingSpinner text="Loading products..." />
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p) => (
            <ProductCard key={p.product_id} product={p} />
          ))}
        </div>
      ) : (
        <div className="neo-card text-center py-12">
          <p className="text-xl font-black opacity-50">No products found</p>
          <p className="text-sm opacity-40">Try a different search or filter</p>
        </div>
      )}
    </div>
  );
}
