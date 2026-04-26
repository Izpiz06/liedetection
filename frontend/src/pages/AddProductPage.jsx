import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { productsAPI } from '../services/api';
import useStore from '../store/useStore';
import { Package, ArrowLeft, Sparkles, Link as LinkIcon } from 'lucide-react';

const CATEGORIES = [
  'Electronics',
  'Clothing',
  'Home & Kitchen',
  'Beauty & Personal Care',
  'Sports & Outdoors',
  'Books',
  'Toys & Games',
  'Automotive',
  'Health & Wellness',
  'Food & Beverages',
  'Other',
];

export default function AddProductPage() {
  const navigate = useNavigate();
  const { addToast } = useStore();

  const [form, setForm] = useState({
    product_name: '',
    category: '',
    brand: '',
    product_link: '',
    description: '',
    price: '',
    launch_date: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!form.product_name.trim()) errs.product_name = 'Product name is required';
    if (!form.category) errs.category = 'Category is required';
    if (form.price && (isNaN(Number(form.price)) || Number(form.price) < 0)) {
      errs.price = 'Enter a valid price';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = { ...form };
      if (payload.price) payload.price = parseFloat(payload.price);
      else delete payload.price;
      if (!payload.launch_date) delete payload.launch_date;
      if (!payload.product_link) delete payload.product_link;

      const res = await productsAPI.create(payload);
      addToast('Product added successfully!', 'success');
      navigate(`/products/${res.data.data.product.product_id}`);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to add product';
      addToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="neo-btn bg-white dark:bg-neo-dark-card p-2 !px-3 !py-2"
          title="Go back"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-black flex items-center gap-2">
            <Package className="text-neo-purple" size={28} />
            Add New Product
          </h1>
          <p className="text-sm opacity-60 font-bold">
            List a new product on ReviewShield
          </p>
        </div>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="neo-card space-y-5">
        {/* Product Name */}
        <div>
          <label className="block text-sm font-black mb-1" htmlFor="product_name">
            Product Name <span className="text-neo-red">*</span>
          </label>
          <input
            id="product_name"
            name="product_name"
            type="text"
            value={form.product_name}
            onChange={handleChange}
            placeholder="e.g. Galaxy Buds Pro 2"
            className={`neo-input ${errors.product_name ? 'border-neo-red' : ''}`}
            maxLength={150}
          />
          {errors.product_name && (
            <p className="text-neo-red text-xs font-bold mt-1">{errors.product_name}</p>
          )}
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-black mb-1" htmlFor="category">
            Category <span className="text-neo-red">*</span>
          </label>
          <select
            id="category"
            name="category"
            value={form.category}
            onChange={handleChange}
            className={`neo-input ${errors.category ? 'border-neo-red' : ''}`}
          >
            <option value="">Select a category</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="text-neo-red text-xs font-bold mt-1">{errors.category}</p>
          )}
        </div>

        {/* Brand */}
        <div>
          <label className="block text-sm font-black mb-1" htmlFor="brand">
            Brand
          </label>
          <input
            id="brand"
            name="brand"
            type="text"
            value={form.brand}
            onChange={handleChange}
            placeholder="e.g. Samsung"
            className="neo-input"
            maxLength={100}
          />
        </div>

        {/* Product Link */}
        <div>
          <label className="block text-sm font-black mb-1" htmlFor="product_link">
            <span className="flex items-center gap-1">
              <LinkIcon size={14} />
              Product Link
            </span>
          </label>
          <input
            id="product_link"
            name="product_link"
            type="url"
            value={form.product_link}
            onChange={handleChange}
            placeholder="https://www.example.com/product/galaxy-buds-pro-2"
            className="neo-input"
            maxLength={500}
          />
          <p className="text-xs opacity-40 mt-1">Link to the product page so reviewers know exactly what's being reviewed</p>
        </div>

        {/* Price + Launch Date Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-black mb-1" htmlFor="price">
              Price (₹)
            </label>
            <input
              id="price"
              name="price"
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={handleChange}
              placeholder="0.00"
              className={`neo-input ${errors.price ? 'border-neo-red' : ''}`}
            />
            {errors.price && (
              <p className="text-neo-red text-xs font-bold mt-1">{errors.price}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-black mb-1" htmlFor="launch_date">
              Launch Date
            </label>
            <input
              id="launch_date"
              name="launch_date"
              type="date"
              value={form.launch_date}
              onChange={handleChange}
              className="neo-input"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-black mb-1" htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            value={form.description}
            onChange={handleChange}
            placeholder="Describe the product features, specs, etc."
            className="neo-input resize-none"
          />
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={() => navigate('/products')}
            className="neo-btn bg-white dark:bg-neo-dark-card"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="neo-btn-purple flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Sparkles size={18} />
            {submitting ? 'Adding...' : 'Add Product'}
          </button>
        </div>
      </form>
    </div>
  );
}
