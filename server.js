/*********************************************************************************
 *  WEB322 – Assignment 06
 *  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source
 *  (including 3rd party web sites) or distributed to other students.
 *
 *  Name:JithinBiju Student ID:153532213 Date: 04-DEC-2022
 *
 *  Online (Cyclic) Link: 
 *
 ********************************************************************************/
 var express = require("express");
 var app = express();
 var path = require("path");
 const multer = require("multer");
 const fileUpload = multer();
 const cloudinary = require('cloudinary').v2
 const streamifier = require('streamifier')
 const exphbs = require('express-handlebars');
 const stripJs = require('strip-js');
 const authData = require(__dirname + "/auth-service.js");
const clientSessions = require('client-sessions');

 cloudinary.config({
  cloud_name: 'dexdo1qrk',
  api_key: '421526278881353 ',
  api_secret: 'gFHkoiGEm8gZ5kv0R9YACWalRYs',
      secure: true
  });

  app.engine('.hbs', exphbs.engine({ 
    extname: ".hbs", 
    defaultLayout: "main",
    helpers: {
        navLink: function(url, options){
            return '<li' + 
                ((url == app.locals.activeRoute) ? ' class="active" ' : '') + '><a href="' + url + '">' + options.fn(this) + '</a></li>'; },
        equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        },
      formatDate: function(dateObj){
          let year = dateObj.getFullYear();
          let month = (dateObj.getMonth() + 1).toString();
          let day = dateObj.getDate().toString();
          return `${year}-${month.padStart(2, '0')}-${day.padStart(2,'0')}`;
      }
                   
    } 
}));

app.use(function(req,res,next) {
  let route = req.baseUrl+req.path;
  app.locals.activeRoute = (route == "/") ? "/":route.replace(/\/$/,"");
  next();
});

app.set('view engine', '.hbs');

  //adding path tp product-service.js module to interact with it
 var data = require("./product-service");
 
 var HTTP_PORT = process.env.PORT || 8080;

 onHttpStart = () => {
  console.log("Express http server listening on port " + HTTP_PORT);
}
 data.initialize()
 .then(authData.initialize())
 .then(() => {
     app.listen(HTTP_PORT, onHttpStart())
 }).catch (() => {
     console.log('promises unfulfilled');
 });
 app.use(express.static("public"));
 app.use(express.urlencoded({extended: true}));

 app.use(clientSessions( {
  cookieName: "session",
  secret: "web_a6_secret",
  duration: 2*60*1000,
  activeDuration: 1000*60
}));

app.use((req,res,next) => {
  res.locals.session = req.session;
  next();
});

ensureLogin = (req,res,next) => {
  if (!(req.session.user)) {
      res.redirect("/login");
  }
  else { next(); }
};
 
 //setting up a defualt route for local host
 
 //home
app.get('/', (req, res) => {
  res.render("home");
});

//otherwise /home would return an error
app.get('/home', (req, res) => {
  res.render("home");
});

//route to products
 app.get("/products", ensureLogin,function (req, res) {
   data
     .getPublishedProducts()
     .then(function (data) {
       res.json(data);
     })
     .catch(function (err) {
       res.json({ message: err });
     });
    
});
 
//route to demos
app.get("/demos", ensureLogin,(req, res) => {
  if (req.query.category) {
    data.getProductsByCategory(req.query.category)
      .then((data) => {
        if (data.length == 0) {
          res.render("demos", { message: "no results" });
          return;
        }
        res.render("demos", { products: data });
      })
      .catch((err) => {
        res.render("demos", { message: "no results" });
      });
  } else if (req.query.minDate) {
    data.getProductByMinDate(req.query.minDate)
      .then((data) => {
        if (data.length == 0) {
          res.render("demos", { message: "no results" });
          return;
        }
        res.render("demos", { products: data });
      })
      .catch((err) => {
        res.render("demos", { message: "no results" });
      });
  } else {
    data.getAllProducts()
      .then((data) => {
        if (data.length == 0) {
          res.render("demos", { message: "no results" });
          return;
        }
        console.log("this is demnos rendering");
        res.render("demos", { products: data });
      })
      .catch((err) => res.render("demos", { message: "no results" }));
  }
});

app.get("/demos/delete/:id",ensureLogin, (req, res) => {
  data.deleteProductById(req.params.id)
    .then(() => {
      res.redirect("/demos");
    })
    .catch((err) => {
      res.status(500).send("Unable to Remove Post / Post Not Found");
    });
});

//route to categories
 app.get("/categories", ensureLogin,function (req, res) {
   data.getCategories()
     .then(function (data) {
      res.render("categories", {categories: data});
     })
     .catch(function (err) {
      res.render("categories", {message: "no results"});
     });
 });

//route to Add Product
 app.get('/product/:value',ensureLogin, (req,res) => {
  data.getProductById(req.params.value).then((data) => {
      res.json({data});
  }).catch((err) => {
      res.json({message: err});
  })
 });

 app.get("/products/add",ensureLogin, (req, res) => {
  data.getCategories()
  .then((data) => {
    res.render("addProduct", { categories: data });
  })
  .catch((err) => {
    
    res.render("addProduct", { categories: [] });
  });
});


app.post('/upload', ensureLogin,fileUpload.single('image'), function (req, res, next) {
    let streamUpload = (req) => {
        return new Promise((resolve, reject) => {
            let stream = cloudinary.uploader.upload_stream(
              (error, result) => {
                if (result) {
                  resolve(result);
                } else {
                  reject(error);
                }
              }
            );

          streamifier.createReadStream(req.file.buffer).pipe(stream);
        });
    };

    async function upload(req) {
        let result = await streamUpload(req);
        console.log(result);
    }

    upload(req);
});

app.get("/categories/add", ensureLogin,(req, res) => {
  res.render("addCategory");
});

app.post("/categories/add",ensureLogin, (req, res) => {
  data.addCategory(req.body)
    .then((category) => {
      res.redirect("/categories");
    })
    .catch((err) => {
      res.status(500).send(err.message);
    });
});

app.get("/categories/delete/:id", ensureLogin,(req, res) => {
  data.deleteCategoryById(req.params.id)
    .then(() => {
      res.redirect("/categories");
    })
    .catch((err) => {
      res.status(500).send("Unable to Remove Category / Category Not Found");
    });
});

app.get("/demos/delete/:id",ensureLogin, (req, res) => {
  data.deleteProductById(req.params.id)
    .then(() => {
      res.redirect("/demos");
    })
    .catch((err) => {
      res.status(500).send("Unable to Remove Post / Post Not Found");
    });
});

app.get("/login", (req,res) => {
  res.render("login");
});

app.get("/register", (req,res) => {
  res.render("register");
});

app.post("/register", (req,res) => {
  authData.registerUser(req.body)
  .then(() => res.render("register", {successMessage: "User created" } ))
  .catch (err => res.render("register", {errorMessage: err, userName:req.body.userName }) )
});

app.post("/login", (req,res) => {
  req.body.userAgent = req.get('User-Agent');
  authData.checkUser(req.body)
  .then(user => {
      req.session.user = {
          userName:user.userName,
          email:user.email,
          loginHistory:user.loginHistory
      }
      res.redirect("/demos");
  })
  .catch(err => {
      res.render("login", {errorMessage:err, userName:req.body.userName} )
  }) 
});

app.get("/logout", (req,res) => {
  req.session.reset();
  res.redirect("/login");
});

app.get("/userHistory", ensureLogin, (req,res) => {
  res.render("userHistory", {user:req.session.user} );
});



//if no route found show Page Not Found
 app.use(function (req, res) {
   res.status(404).send("<h2>404</h2><p>Page not found</p>");
 });
 
