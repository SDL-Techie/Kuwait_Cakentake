// import React, { useState, useEffect } from 'react';
// import { ChevronLeft, ChevronRight } from 'lucide-react';
// import { useNavigate } from 'react-router-dom';
// import './CategorySlider.css';
// import { storefrontApi } from '../../services/directApiService';
// import { useCurrency } from '../../context/CurrencyContext';

// interface Category {
//   _id: string;
//   name: string;
//   image?: string;
//   description?: string;
// }

// const CircularCategorySlider = () => {
//   const navigate = useNavigate();
//   const { currency } = useCurrency();
//   const [categories, setCategories] = useState<Category[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [currentSlide, setCurrentSlide] = useState(0);
//   const [cardsPerSlide, setCardsPerSlide] = useState(5);

//   const updateCardsPerSlide = () => {
//     const width = window.innerWidth;
//     if (width <= 768) {
//       setCardsPerSlide(2);
//     } else if (width <= 1024) {
//       setCardsPerSlide(3);
//     } else {
//       setCardsPerSlide(5);
//     }
//   };

//   // Fetch categories from API
//   useEffect(() => {
//     const fetchCategories = async () => {
//       try {
//         setLoading(true);
//         const response = await storefrontApi.categories();
//         const data = response.data;

//         const transformedCategories: Category[] = data.map((item: any) => ({
//           _id: item._id ?? item.id,
//           name: item.name,
//           image: item.image || 'https://via.placeholder.com/300x300?text=' + item.name,
//           description: item.description || `Discover our ${item.name}`,
//         }));

//         setCategories(transformedCategories);
//         setLoading(false);
//       } catch (err) {
//         console.error('Error fetching categories:', err);
//         setLoading(false);

//         // Fallback data
//         setCategories([
//           {
//             _id: '1',
//             name: 'Chocolate Truffle',
//             image: 'https://via.placeholder.com/300x300?text=Chocolate+Truffle',
//             description: 'Rich chocolate truffle',
//           },
//           {
//             _id: '2',
//             name: 'Custard Cake',
//             image: 'https://via.placeholder.com/300x300?text=Custard+Cake',
//             description: 'Delicious custard cake',
//           },
//           {
//             _id: '3',
//             name: 'Almond Bread',
//             image: 'https://via.placeholder.com/300x300?text=Almond+Bread',
//             description: 'Fresh almond bread',
//           },
//           {
//             _id: '4',
//             name: 'Strawberry Cake',
//             image: 'https://via.placeholder.com/300x300?text=Strawberry',
//             description: 'Fresh strawberry cake',
//           },
//           {
//             _id: '5',
//             name: 'Vanilla Pastry',
//             image: 'https://via.placeholder.com/300x300?text=Vanilla+Pastry',
//             description: 'Classic vanilla pastry',
//           },
//           {
//             _id: '6',
//             name: 'Macaron',
//             image: 'https://via.placeholder.com/300x300?text=Macaron',
//             description: 'Delicate macaron',
//           },
//         ]);
//       }
//     };

//     fetchCategories();
//   }, []);

//   useEffect(() => {
//     updateCardsPerSlide();
//     window.addEventListener('resize', updateCardsPerSlide);
//     return () => window.removeEventListener('resize', updateCardsPerSlide);
//   }, []);

//   const totalSlides = Math.max(1, Math.ceil(categories.length / cardsPerSlide));

//   useEffect(() => {
//     if (currentSlide >= totalSlides) {
//       setCurrentSlide(0);
//     }
//   }, [currentSlide, totalSlides]);

//   useEffect(() => {
//     const intervalId = window.setInterval(() => {
//       setCurrentSlide((prev) => (prev + 1) % totalSlides);
//     }, 5000);

//     return () => window.clearInterval(intervalId);
//   }, [totalSlides]);

//   const handlePrev = () => {
//     setCurrentSlide((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
//   };

//   const handleNext = () => {
//     setCurrentSlide((prev) => (prev + 1) % totalSlides);
//   };

//   const handleCategoryClick = (category: Category) => {
//     // No navigation required for this slider.
//     // This keeps the category cards interactive without changing pages.
  
//   };

//   if (loading) {
//     return (
//       <div className="circular-slider-wrapper loading">
//         <div className="spinner"></div>
//         <p>Loading categories...</p>
//       </div>
//     );
//   }

//   if (categories.length === 0) {
//     return (
//       <div className="circular-slider-wrapper error">
//         <p>No categories available</p>
//       </div>
//     );
//   }

//   const visibleCategories = categories.slice(
//     currentSlide * cardsPerSlide,
//     currentSlide * cardsPerSlide + cardsPerSlide
//   );

//   return (
//     <div className="circular-slider-wrapper">
//       {/* Header */}
//       <div className="slider-header">
//         <h2 className="slider-title">Our Delicacies</h2>
//         <p className="slider-subtitle">Explore our finest selections</p>
//       </div>

//       {/* Slider Container */}
//       <div className="circular-slider-container">
//         {/* Navigation - Left */}
//         {totalSlides > 1 && (
//           <button className="nav-button prev" onClick={handlePrev} aria-label="Previous">
//             <ChevronLeft size={28} />
//           </button>
//         )}

//         {/* Circular Cards */}
//         <div className="cards-wrapper">
//           {visibleCategories.map((category, index) => (
//             <div
//               key={category._id}
//               className="circular-card"
//               style={{
//                 animation: `slideIn 0.5s ease-out ${index * 0.1}s both`,
//               }}
//             >
//               {/* Circular Frame */}
//               <div className="card-circle">
//                 <img
//                   src={category.image}
//                   alt={category.name}
//                   className="card-image"
//                   loading="lazy"
//                 />
//                 <div className="circle-border"></div>

//                 {/* Hover overlay showing the category name */}
//                 <div className="card-hover-overlay">
//                   <span className="card-hover-name">{category.name}</span>
//                 </div>
//               </div>

//               {/* Card Info */}
//               <div className="card-info">
//                 <h3 className="card-name">{category.name}</h3>
//                 <p className="card-desc">{category.description}</p>
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* Navigation - Right */}
//         {totalSlides > 1 && (
//           <button className="nav-button next" onClick={handleNext} aria-label="Next">
//             <ChevronRight size={28} />
//           </button>
//         )}
//       </div>

//       {/* Dots Indicator */}
//       <div className="dots-container">
//         {Array.from({ length: totalSlides }).map((_, i) => (
//           <button
//             key={i}
//             className={`dot ${i === currentSlide ? 'active' : ''}`}
//             onClick={() => setCurrentSlide(i)}
//             aria-label={`Go to group ${i + 1}`}
//           />
//         ))}
//       </div>
//     </div>
//   );
// };

// export default CircularCategorySlider;


import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './CategorySlider.css';
import { storefrontApi } from '../../services/directApiService';
import { useCurrency } from '../../context/CurrencyContext';

interface Category {
  _id: string;
  name: string;
  image?: string;
  description?: string;
}

const CircularCategorySlider = () => {
  const navigate = useNavigate();
  const { currency } = useCurrency();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [cardsPerSlide, setCardsPerSlide] = useState(5);

  const updateCardsPerSlide = () => {
    const width = window.innerWidth;
    if (width <= 768) {
      setCardsPerSlide(2);
    } else if (width <= 1024) {
      setCardsPerSlide(3);
    } else {
      setCardsPerSlide(5);
    }
  };

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await storefrontApi.categories();
        const data = response.data;

        const transformedCategories: Category[] = data.map((item: any) => ({
          _id: item._id ?? item.id,
          name: item.name,
          image: item.image || 'https://via.placeholder.com/300x300?text=' + item.name,
          description: item.description || `Discover our ${item.name}`,
        }));

        setCategories(transformedCategories);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setLoading(false);

        // Fallback data
        setCategories([
          {
            _id: '1',
            name: 'Chocolate Truffle',
            image: 'https://via.placeholder.com/300x300?text=Chocolate+Truffle',
            description: 'Rich chocolate truffle',
          },
          {
            _id: '2',
            name: 'Custard Cake',
            image: 'https://via.placeholder.com/300x300?text=Custard+Cake',
            description: 'Delicious custard cake',
          },
          {
            _id: '3',
            name: 'Almond Bread',
            image: 'https://via.placeholder.com/300x300?text=Almond+Bread',
            description: 'Fresh almond bread',
          },
          {
            _id: '4',
            name: 'Strawberry Cake',
            image: 'https://via.placeholder.com/300x300?text=Strawberry',
            description: 'Fresh strawberry cake',
          },
          {
            _id: '5',
            name: 'Vanilla Pastry',
            image: 'https://via.placeholder.com/300x300?text=Vanilla+Pastry',
            description: 'Classic vanilla pastry',
          },
          {
            _id: '6',
            name: 'Macaron',
            image: 'https://via.placeholder.com/300x300?text=Macaron',
            description: 'Delicate macaron',
          },
        ]);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    updateCardsPerSlide();
    window.addEventListener('resize', updateCardsPerSlide);
    return () => window.removeEventListener('resize', updateCardsPerSlide);
  }, []);

  const totalSlides = Math.max(1, Math.ceil(categories.length / cardsPerSlide));

  useEffect(() => {
    if (currentSlide >= totalSlides) {
      setCurrentSlide(0);
    }
  }, [currentSlide, totalSlides]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [totalSlides]);

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const handleCategoryClick = (category: Category) => {
    navigate(`/categoryproduct/${category._id}`);
  };

  if (loading) {
    return (
      <div className="circular-slider-wrapper loading">
        <div className="spinner"></div>
        <p>Loading categories...</p>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="circular-slider-wrapper error">
        <p>No categories available</p>
      </div>
    );
  }

  const visibleCategories = categories.slice(
    currentSlide * cardsPerSlide,
    currentSlide * cardsPerSlide + cardsPerSlide
  );

  return (
    <div className="circular-slider-wrapper">
      {/* Header */}
      <div className="slider-header">
        <h2 className="slider-title">Our Delicacies</h2>
        <p className="slider-subtitle">Explore our finest selections</p>
      </div>

      {/* Slider Container */}
      <div className="circular-slider-container">
        {/* Navigation - Left */}
        {totalSlides > 1 && (
          <button className="nav-button prev" onClick={handlePrev} aria-label="Previous">
            <ChevronLeft size={28} />
          </button>
        )}

        {/* Circular Cards */}
        <div className="cards-wrapper">
          {visibleCategories.map((category, index) => (
            <div
              key={category._id}
              className="circular-card"
              role="button"
              tabIndex={0}
              onClick={() => handleCategoryClick(category)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleCategoryClick(category);
                }
              }}
              style={{
                cursor: 'pointer',
                animation: `slideIn 0.5s ease-out ${index * 0.1}s both`,
              }}
            >
              {/* Circular Frame */}
              <div className="card-circle">
                <img
                  src={category.image}
                  alt={category.name}
                  className="card-image"
                  loading="lazy"
                />
                <div className="circle-border"></div>

                {/* Hover overlay showing the category name */}
                <div className="card-hover-overlay">
                  <span className="card-hover-name">{category.name}</span>
                </div>
              </div>

              {/* Card Info */}
              <div className="card-info">
                <h3 className="card-name">{category.name}</h3>
                <p className="card-desc">{category.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation - Right */}
        {totalSlides > 1 && (
          <button className="nav-button next" onClick={handleNext} aria-label="Next">
            <ChevronRight size={28} />
          </button>
        )}
      </div>

      {/* Dots Indicator */}
      <div className="dots-container">
        {Array.from({ length: totalSlides }).map((_, i) => (
          <button
            key={i}
            className={`dot ${i === currentSlide ? 'active' : ''}`}
            onClick={() => setCurrentSlide(i)}
            aria-label={`Go to group ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default CircularCategorySlider;