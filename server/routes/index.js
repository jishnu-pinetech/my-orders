/**
 * Router server.js
 */
 const Orders = require('../controllers/orders');
 const Users = require('../controllers/users');
 const Products = require('../controllers/product');
 
 exports.default = app => {
     app.get('/', (req, res, next) => {
         res.send('App working successfully');
     });
 
     app.get('/orders', Orders.getOrders);
 
     app.post('/order', Orders.createOrder);
 
     app.get('/order/:orderID', Orders.orderDetails);
 
     app.put('/order/:orderID', Orders.updateOrder);
 
     app.delete('/order/:orderID', Orders.removeOrder);
 
     app.get('/users', Users.getUsers);
 
     app.post('/user', Users.createuser);
 
     app.get('/products', Products.getProducts);
 
     app.post('/product', Products.createProduct);
 }
 