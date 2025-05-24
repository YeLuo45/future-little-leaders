import { defineStore } from 'pinia';

export const useShopStore = defineStore('shop', {
  state: () => ({
    products: [],
    isLoaded: false
  }),
  
  getters: {
    /**
     * 获取排序后的商品列表
     * 库存为0的排在最后，同为0的按创建时间降序
     */
    sortedProducts: (state) => {
      if (!state.products || state.products.length === 0) {
        return [];
      }
      
      return [...state.products].sort((a, b) => {
        // 如果a库存为0但b不为0，a排后面
        if ((a.stock === 0 || a.stock === '0') && (b.stock !== 0 && b.stock !== '0')) {
          return 1;
        }
        // 如果b库存为0但a不为0，b排后面
        if ((b.stock === 0 || b.stock === '0') && (a.stock !== 0 && a.stock !== '0')) {
          return -1;
        }
        // 如果都为0，按创建时间降序（新的在前）
        if ((a.stock === 0 || a.stock === '0') && (b.stock === 0 || b.stock === '0')) {
          const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return bTime - aTime; // 降序排列
        }
        // 其他情况保持原始顺序
        return 0;
      });
    },
    
    /**
     * 根据关键词搜索商品
     */
    searchProducts: (state) => (keyword) => {
      if (!keyword || !keyword.trim()) {
        return state.sortedProducts;
      }
      
      const lowercaseKeyword = keyword.toLowerCase().trim();
      return state.sortedProducts.filter(item => {
        return (
          (item.name && item.name.toLowerCase().includes(lowercaseKeyword)) ||
          (item.description && item.description.toLowerCase().includes(lowercaseKeyword))
        );
      });
    }
  },
  
  actions: {
    /**
     * 加载商品列表
     */
    loadProducts() {
      try {
        const storedProducts = uni.getStorageSync('shopProducts');
        if (storedProducts) {
          if (typeof storedProducts === 'string') {
            const parsedProducts = JSON.parse(storedProducts);
            if (Array.isArray(parsedProducts)) {
              // 确保所有商品有创建时间
              this.products = parsedProducts.map(product => {
                if (!product.createdAt) {
                  product.createdAt = new Date().toISOString();
                }
                return product;
              });
            } else {
              this.products = [];
              console.warn('存储的商品数据不是数组，已重置为空数组');
            }
          } else if (Array.isArray(storedProducts)) {
            this.products = storedProducts;
          } else {
            this.products = [];
            console.warn('存储的商品数据格式错误，已重置为空数组');
          }
        } else {
          // 设置默认商品
          this.setDefaultProducts();
        }
        this.isLoaded = true;
      } catch (e) {
        console.error('加载商品列表失败:', e);
        this.setDefaultProducts();
        this.isLoaded = true;
      }
    },
    
    /**
     * 设置默认商品
     */
    setDefaultProducts() {
      this.products = [
        {
          name: '游戏时间30分钟',
          points: 50,
          stock: '无限',
          icon: '🎮',
          description: '获得额外30分钟游戏时间，可在周末或假期使用。兑换后立即生效。',
          createdAt: new Date().toISOString()
        },
        {
          name: '新玩具',
          points: 200,
          stock: 5,
          icon: '🎁',
          description: '可从玩具柜中选择一款喜欢的玩具带回家。限量供应，先到先得。',
          createdAt: new Date().toISOString()
        }
      ];
      
      this.saveProducts();
    },
    
    /**
     * 保存商品列表到存储
     */
    saveProducts() {
      try {
        uni.setStorageSync('shopProducts', JSON.stringify(this.products));
        return true;
      } catch (e) {
        console.error('保存商品列表失败:', e);
        return false;
      }
    },
    
    /**
     * 添加商品
     */
    addProduct(product) {
      // 确保有创建时间
      if (!product.createdAt) {
        product.createdAt = new Date().toISOString();
      }
      
      this.products.push(product);
      return this.saveProducts();
    },
    
    /**
     * 更新商品
     */
    updateProduct(index, updatedProduct) {
      if (index >= 0 && index < this.products.length) {
        // 保留原始创建时间
        const originalCreatedAt = this.products[index].createdAt;
        updatedProduct.createdAt = originalCreatedAt;
        
        // 更新商品
        this.products[index] = updatedProduct;
        return this.saveProducts();
      }
      return false;
    },
    
    /**
     * 更新商品库存
     */
    updateProductStock(index, newStock) {
      if (index >= 0 && index < this.products.length) {
        this.products[index].stock = newStock;
        return this.saveProducts();
      }
      return false;
    },
    
    /**
     * 兑换商品（减少库存）
     */
    exchangeProduct(index) {
      if (index < 0 || index >= this.products.length) {
        return false;
      }
      
      const product = this.products[index];
      
      // 如果库存是"无限"，不减少库存
      if (product.stock === '无限' || product.stock === undefined) {
        return true;
      }
      
      // 将库存转为数字进行计算
      let stock = parseInt(product.stock);
      if (isNaN(stock) || stock <= 0) {
        return false; // 库存不足
      }
      
      // 减少库存
      this.products[index].stock = (stock - 1).toString();
      return this.saveProducts();
    },
    
    /**
     * 删除商品
     */
    deleteProduct(index) {
      if (index >= 0 && index < this.products.length) {
        this.products.splice(index, 1);
        return this.saveProducts();
      }
      return false;
    },
    
    /**
     * 根据ID获取商品索引
     */
    getProductIndexById(productId) {
      return this.products.findIndex(p => p.id === productId);
    }
  }
}); 