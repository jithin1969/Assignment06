const Sequelize = require('sequelize');
var sequelize = new Sequelize('fiftootu', 'fiftootu', '8x8pIxUoXrz6zChLogHvZ1FHKSyWSYU8', {
    host: 'jelani.db.elephantsql.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    },
    query: { raw: true }
});

var Product = sequelize.define("Product", {
  body: Sequelize.TEXT,
  title: Sequelize.STRING,
  postDate: Sequelize.DATE,
  featureImage: Sequelize.STRING,
  published: Sequelize.BOOLEAN,
});

var Category = sequelize.define("Category", {
  category: Sequelize.STRING,
});

Product.belongsTo(Category, { foreignKey: "category" });

module.exports.initialize = function () {
  return sequelize.sync();

};

module.exports.getAllProducts = function () {
  return new Promise((resolve, reject) => {
    Product.findAll()
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        reject("no results returned");
      });
  });

};

module.exports.getProductsByCategory = (category) => {
  return new Promise((resolve, reject) => {
    Product.findAll({
      where: { category: category },
    })
      .then((data) => {
        resolve(data);
      })
      .catch(() => {
        reject("no results returned");
      });
  });
};

module.exports.getProductsByMinDate = (minDateStr) => {
  const { gte } = Sequelize.Op;
  return new Promise((resolve, reject) => {
    Product
      .findAll({
        where: {
          postDate: {
            [gte]: new Date(minDateStr),
          },
        },
      })
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        reject("no results returned");
      });
  });
};

module.exports.getProductById  = (id) => {
  return new Promise((resolve, reject) => {
    Product.findAll({
        where: {
          id: id,
        },
      })
      .then((data) => {
        resolve(data[0]);
      })
      .catch((err) => {
        reject("no results returned");
      });
  });
};

module.exports.addProduct = function () {
  return new Promise((resolve, reject) => {
    productData.published = productData.published ? true : false;

    for (var element in productData) {
      if (productData[prop] == "") productData[element] = null;
    }

    productData.postDate = new Date();

    Product.create(productData)
      .then(() => {
        resolve();
      })
      .catch((err) => {
        reject("unable to create post");
      });
  });

};


module.exports.getPublishedProducts = function () {
  return new Promise((resolve, reject) => {
    Product.findAll({
      where: { published: true },
    })
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        reject("no results returned");
      });
  });

};

module.exports.getPublishedProductsByCategory = function (category) {
  return new Promise((resolve, reject) => {
    Product.findAll({
      where: { category: category, published: true },
    })
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        reject("no results returned");
      });
  });
};

module.exports.getCategories = () => {
  return new Promise((resolve, reject) => {
    Category.findAll()
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        reject("no results returned");
      });
  });
};

//new
module.exports.addCategory = function (categoryData) {
  return new Promise((resolve, reject) => {
    for (var element in categoryData) {
      if (categoryData[element] == "") categoryData[element] = null;
    }

    Category.create(categoryData)
      .then(() => {
        resolve();
      })
      .catch((err) => {
        reject("unable to create category");
      });
  });
};

module.exports.deleteCategoryById = function (id) {
  return new Promise((resolve, reject) => {
      Category.destroy({
          where: {
              id: id
          }
      }).then( data => {
          resolve();
      }).catch((err) => {
          reject("unable to delete category");
      });
  });
};

module.exports.deleteProductById = function (id) {
  return new Promise((resolve, reject) => {
    Product.destroy({
      where: {
        id: id,
      },
    })
      .then((data) => {
        resolve();
      })
      .catch((err) => {
        reject("unable to delete post");
      });
  });
};





