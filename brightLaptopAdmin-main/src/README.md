# BlAdminUI Project Structure

This document explains the advanced folder structure and architecture of the BlAdminUI project.

## 📁 Folder Structure

```
src/
├── api/                    # API layer - HTTP client configuration and services
│   ├── axios.config.js     # Axios instance with interceptors
│   └── services/           # API service modules
│       ├── product.service.js
│       ├── upload.service.js
│       └── index.js
│
├── components/             # React components
│   ├── auth/              # Authentication components
│   ├── common/            # Shared/common components
│   └── modals/            # Modal components
│
├── config/                # Configuration files
│   └── api.config.js      # API endpoints and settings
│
├── hooks/                 # Custom React hooks
│   ├── useProducts.js     # Product operations hook
│   └── useUpload.js       # File upload operations hook
│
├── pages/                 # Page components
│
├── utils/                 # Utility functions
│   ├── validation.js     # Form validation utilities
│   └── constants.js       # Application constants
│
├── data/                  # Static data and mock data
│
└── assets/                # Static assets (images, etc.)
```

## 🏗️ Architecture Overview

### API Layer (`src/api/`)

The API layer is responsible for all HTTP communication with the backend.

#### `axios.config.js`
- Centralized axios instance
- Request interceptor: Adds authentication token from localStorage
- Response interceptor: Handles 401 errors and redirects to login
- Base URL configuration

#### `services/`
- **product.service.js**: All product-related API calls
  - `createProduct()` - Create new product
  - `getProducts()` - Fetch all products
  - `getProductById()` - Fetch single product
  - `updateProduct()` - Update product
  - `deleteProduct()` - Delete product
  - `getProductCategories()` - Get categories
  - `getBrands()` - Get brands
  - `searchProducts()` - Search products

- **upload.service.js**: File upload operations
  - `uploadImages()` - Upload multiple images
  - `uploadSingleImage()` - Upload single image

### Configuration (`src/config/`)

#### `api.config.js`
- Centralized API configuration
- Base URL from environment variables
- All API endpoints organized by domain
- Request timeout and retry configuration

### Custom Hooks (`src/hooks/`)

#### `useProducts.js`
Provides easy-to-use functions for product operations:
```javascript
const { create, fetchAll, fetchById, update, remove, loading, error } = useProducts();
```

#### `useUpload.js`
Provides file upload functionality:
```javascript
const { uploadMultiple, uploadSingle, loading, error, progress } = useUpload();
```

### Utilities (`src/utils/`)

#### `validation.js`
- `isValidEmail()` - Email validation
- `isValidUrl()` - URL validation
- `validateRequiredFields()` - Required fields validation
- `validateNumberRange()` - Number range validation
- `validateProductData()` - Product data validation

#### `constants.js`
- Product categories
- Product conditions
- RAM/Storage options
- Warranty options
- Default values
- Field labels

## 🔌 API Integration

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### Authentication

The axios interceptor automatically adds the JWT token from localStorage:
```javascript
localStorage.setItem('token', 'your-jwt-token');
```

### Using API Services

#### Example: Create Product

```javascript
import { useProducts } from '../hooks/useProducts';

const MyComponent = () => {
  const { create, loading, error } = useProducts();
  
  const handleSubmit = async (productData) => {
    const result = await create(productData);
    if (result.success) {
      console.log('Product created:', result.data);
    } else {
      console.error('Error:', result.error);
    }
  };
};
```

#### Example: Upload Images

```javascript
import { useUpload } from '../hooks/useUpload';

const MyComponent = () => {
  const { uploadMultiple, loading } = useUpload();
  
  const handleImageUpload = async (files) => {
    const result = await uploadMultiple(files);
    if (result.success) {
      const imageUrls = result.data.data.images.map(img => img.secure_url);
      console.log('Uploaded images:', imageUrls);
    }
  };
};
```

## 📝 Product Modal

The `ProductModal` component includes all fields from the backend API:

### Required Fields
- Name
- Images (at least 1)
- Base Price
- Stock
- Category

### Optional Fields
- Description
- Brand
- Condition (new/refurbished)
- MRP
- Discount Percentage
- B2B Price
- GST Settings
- MOQ
- Bulk Pricing Tiers
- Specifications
- Warranty Options
- Shipping Settings
- Offers

## 🚀 Best Practices

1. **Always use hooks** for API calls instead of calling services directly
2. **Handle loading and error states** in components
3. **Validate data** before submitting to API
4. **Use environment variables** for API configuration
5. **Keep API services focused** on single responsibilities
6. **Use TypeScript or JSDoc** for better type safety (future enhancement)

## 🔄 Future Enhancements

- [ ] Add TypeScript support
- [ ] Add request/response caching
- [ ] Add retry logic for failed requests
- [ ] Add request cancellation
- [ ] Add request/response logging
- [ ] Add unit tests for API services
- [ ] Add integration tests







