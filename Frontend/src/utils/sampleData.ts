// Sample data initialization script - run this in browser console to populate localStorage with test data

export const initializeSampleData = () => {
  // Sample cart data
  const sampleCart = [
    {
      id: 1,
      name: 'Chocolate Truffle Cake',
      price: 599,
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=200'
    },
    {
      id: 2,
      name: 'Butter Croissants',
      price: 249,
      quantity: 2,
      image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=200'
    }
  ];

  // Sample orders data
  const sampleOrders = [
    {
      id: '1001',
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      total: 1097,
      status: 'Delivered',
      items: [
        {
          id: 1,
          name: 'Chocolate Truffle Cake',
          price: 599,
          quantity: 1,
          image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=200'
        },
        {
          id: 2,
          name: 'Butter Croissants',
          price: 249,
          quantity: 2,
          image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=200'
        }
      ]
    },
    {
      id: '1002',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      total: 799,
      status: 'Shipped',
      items: [
        {
          id: 3,
          name: 'Belgian Waffle Pastry',
          price: 299,
          quantity: 1,
          image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200'
        },
        {
          id: 4,
          name: 'Sourdough Bread',
          price: 199,
          quantity: 2,
          image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=200'
        }
      ]
    },
    {
      id: '1003',
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      total: 599,
      status: 'Pending',
      items: [
        {
          id: 5,
          name: 'Red Velvet Cupcakes',
          price: 599,
          quantity: 1,
          image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=200'
        }
      ]
    }
  ];

  // Sample wishlist data
  const sampleWishlist = [
    {
      id: 6,
      name: 'Cheesecake',
      price: 699,
      image: 'https://images.unsplash.com/photo-1612874742237-6526221fcf4f?w=200'
    },
    {
      id: 7,
      name: 'Mango Tart',
      price: 349,
      image: 'https://images.unsplash.com/photo-1535920527107-b660adf92e45?w=200'
    },
    {
      id: 8,
      name: 'Macarons Assorted',
      price: 449,
      image: 'https://images.unsplash.com/photo-1569718212b35c1a8b5b48ecb2d9e9f8c?w=200'
    }
  ];

  // Set localStorage
  localStorage.setItem('cnt_cart', JSON.stringify(sampleCart));
  localStorage.setItem('cnt_orders', JSON.stringify(sampleOrders));
  localStorage.setItem('cnt_wishlist', JSON.stringify(sampleWishlist));
};

// Initialize on import
if (typeof window !== 'undefined') {
  (window as any).initializeSampleData = initializeSampleData;
}
