return (
    <div className="py-8 font-sans animate-fade-in">
      
      {/* Brutalist Hero Banner */}
      <div className="relative mb-12 bg-neutral-100 border border-neutral-200 p-8 sm:p-12 md:p-16 flex flex-col lg:flex-row items-center justify-between gap-12 min-h-[500px]">
        
        {/* Left Column: Typography & CTA */}
        <div className="relative z-10 flex-1 max-w-xl space-y-8">
          <div className="inline-block bg-black text-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em]">
            Limited Time Offer
          </div>

          <div className="space-y-4">
            <h1 className="font-display text-5xl sm:text-7xl font-black text-neutral-900 tracking-tighter uppercase leading-[0.9]">
              Experience<br />Pure Sound.
            </h1>
            <p className="text-sm text-neutral-600 max-w-sm font-medium uppercase tracking-widest">
              Premium Wireless Series
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-6 pt-4">
            <button
              onClick={() => {
                setSelectedCategory('Audio');
                document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-black text-white px-8 py-4 text-xs font-bold uppercase tracking-widest hover:bg-neutral-800 transition-colors flex items-center justify-center space-x-3 cursor-pointer group/hero"
            >
              <span>Shop Collection</span>
              <ArrowRight className="w-4 h-4 group-hover/hero:translate-x-1 transition-transform" />
            </button>
            
            <div className="flex flex-col border-l-2 border-neutral-200 pl-6">
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Up To</span>
              <span className="text-3xl font-black text-neutral-900 tracking-tighter leading-none my-1">50% OFF</span>
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Select Items</span>
            </div>
          </div>
        </div>

        {/* Right Column: Floating Image */}
        <div className="relative z-10 flex-1 flex items-center justify-center mix-blend-multiply">
          <div className="relative w-72 h-72 sm:w-96 sm:h-96 md:w-[420px] md:h-[420px]">
            {imageError ? (
              <div className="w-full h-full flex flex-col items-center justify-center bg-white border border-neutral-200">
                <Headphones className="w-24 h-24 text-neutral-300 mb-4 stroke-1" />
                <span className="text-xs font-bold text-neutral-900 tracking-widest uppercase">Pure Sound</span>
              </div>
            ) : (
              <img
                src={heroHeadphonesSrc}
                onError={() => setImageError(true)}
                alt="Premium Headphones"
                className="w-full h-full object-contain hover:scale-105 transition-transform duration-[800ms]"
                referrerPolicy="no-referrer"
              />
            )}
          </div>
        </div>
      </div>

      {/* Bottom Highlights Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border border-neutral-200 mb-16 bg-white">
        {[
          { icon: <Battery className="w-5 h-5" />, title: "40 Hours", sub: "Battery" },
          { icon: <Volume2 className="w-5 h-5" />, title: "Active Noise", sub: "Cancellation" },
          { icon: <Music className="w-5 h-5" />, title: "Hi-Res", sub: "Audio" },
          { icon: <Bluetooth className="w-5 h-5" />, title: "Bluetooth 5.4", sub: "Connectivity" }
        ].map((feature, idx) => (
          <div key={idx} className="p-6 flex items-center space-x-4 border-b md:border-b-0 border-r last:border-r-0 border-neutral-200 hover:bg-neutral-50 transition-colors">
            <div className="text-neutral-900">{feature.icon}</div>
            <div>
              <p className="font-bold text-neutral-900 text-xs uppercase tracking-wider">{feature.title}</p>
              <p className="text-[10px] text-neutral-500 font-medium uppercase tracking-widest">{feature.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Catalog Filters Bar */}
      <div id="catalog-section" className="mb-12">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 pb-6 border-b-2 border-neutral-900">
          <div>
            <h2 className="font-display text-3xl font-black text-neutral-900 tracking-tighter uppercase">Featured Products</h2>
            <p className="text-xs text-neutral-500 mt-2 font-bold tracking-widest uppercase">Showing {filteredProducts.length} Items</p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* Minimalist Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="SEARCH..."
                className="w-full pl-10 pr-4 py-3 text-xs font-bold tracking-widest uppercase bg-transparent border border-neutral-300 focus:border-neutral-900 outline-none transition-colors"
              />
            </div>

            {/* Minimalist Sort Dropdown */}
            <div className="flex items-center space-x-2 px-4 py-3 border border-neutral-300">
              <SlidersHorizontal className="w-4 h-4 text-neutral-900" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-xs font-bold tracking-widest uppercase bg-transparent outline-none text-neutral-900 cursor-pointer"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Categories Pills - Brutalist Style */}
        <div className="flex overflow-x-auto py-6 scrollbar-none gap-3">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-5 py-2 text-[10px] font-bold uppercase tracking-[0.2em] transition-colors border ${
                selectedCategory === category
                  ? 'bg-black text-white border-black'
                  : 'bg-transparent text-neutral-500 border-neutral-300 hover:text-black hover:border-black'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Catalog Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-24 border border-neutral-200 bg-neutral-50">
          <p className="text-neutral-500 text-sm font-bold uppercase tracking-widest">No products found.</p>
          <button
            onClick={() => { setSearch(''); setSelectedCategory('All'); }}
            className="mt-4 text-black text-xs font-bold uppercase tracking-widest border-b border-black pb-1 hover:text-neutral-500 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-0 border-t border-l border-neutral-200">
          {filteredProducts.map((product) => {
            const inCartQty = getCartQuantity(product.id);
            const isOutOfStock = product.stock <= 0;

            return (
              <div
                key={product.id}
                className="group relative bg-white border-b border-r border-neutral-200 flex flex-col hover:bg-neutral-50 transition-colors"
              >
                {/* Product Image Stage */}
                <div 
                  className="relative aspect-square p-8 cursor-pointer flex items-center justify-center" 
                  onClick={() => setCurrentView({ page: 'detail', productId: product.id })}
                >
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-105 mix-blend-multiply"
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Category Pill */}
                  <span className="absolute top-0 left-0 px-3 py-1.5 bg-black text-white text-[9px] font-bold uppercase tracking-widest">
                    {product.category}
                  </span>

                  {/* Quick look action sheet */}
                  <div className="absolute inset-0 bg-white/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center backdrop-blur-[1px]">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentView({ page: 'detail', productId: product.id });
                      }}
                      className="px-6 py-3 bg-black hover:bg-neutral-800 text-white text-[10px] font-bold uppercase tracking-widest flex items-center space-x-2 transition-all transform translate-y-2 group-hover:translate-y-0 duration-300"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View Details</span>
                    </button>
                  </div>
                </div>

                {/* Card Info Box */}
                <div className="p-6 flex-1 flex flex-col border-t border-neutral-200">
                  <h3 className="font-display font-black text-sm sm:text-base text-neutral-900 uppercase leading-snug line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-neutral-500 text-[10px] mt-2 mb-4 line-clamp-2 leading-relaxed uppercase tracking-wider">
                    {product.description}
                  </p>

                  <div className="mt-auto flex items-center justify-between pt-4">
                    <span className="text-sm sm:text-lg font-black text-neutral-900">
                      ₹{product.price.toLocaleString('en-IN')}
                    </span>

                    {isOutOfStock ? (
                      <span className="px-3 py-1.5 bg-neutral-100 text-neutral-400 text-[9px] font-bold uppercase tracking-widest">
                        Out
                      </span>
                    ) : (
                      <button
                        onClick={() => onAddToCart(product)}
                        className={`w-10 h-10 flex items-center justify-center border transition-colors ${
                          inCartQty > 0
                            ? 'bg-black text-white border-black'
                            : 'bg-transparent text-black border-neutral-300 hover:border-black'
                        }`}
                      >
                        {inCartQty > 0 ? <CheckCircle className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Dynamic Ordered Sections from Website Settings */}
      {/* ... [Keep existing section rendering logic] ... */}

    </div>
  );
