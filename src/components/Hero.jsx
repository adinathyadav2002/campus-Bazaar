// src/components/Hero.jsx

const Hero = () => {
    return (
      <section className="bg-gray-100 py-20">
        <div className="max-w-7xl mx-auto text-center px-4">
          {/* Headline */}
          <h1 className="text-5xl font-bold text-gray-800 leading-tight">
            Buy & Sell <span className="text-blue-600">Stationery and Textbooks</span>
          </h1>
          <p className="text-gray-600 mt-4 text-lg">
            Connect with students and find the best deals in your campus!
          </p>
  
          {/* Search Bar */}
          <div className="mt-8 flex justify-center items-center space-x-2">
            <input
              type="text"
              placeholder="Search for books, stationery..."
              className="w-1/2 p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
            />
            <button className="bg-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-600">
              Search
            </button>
          </div>
  
          {/* Categories */}
          <div className="flex justify-center mt-8 space-x-4">
            <button className="bg-white border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-200">
              📚 Textbooks
            </button>
            <button className="bg-white border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-200">
              ✏️ Stationery
            </button>
            <button className="bg-white border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-200">
              📝 Notes
            </button>
            <button className="bg-white border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-200">
              🎒 Bags
            </button>
          </div>
        </div>
      </section>
    );
  };
  
  export default Hero;
  