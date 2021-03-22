/**
 * Controller : order
 */
const moment = require('moment');
const orders = require("../adapters/orders");
const Products = require('../adapters/products');
const users = require("../adapters/users");

/**
 * createOrder : create an order
 */
exports.createOrder = async (req, res, next) => {
    const {
        id_user: userID,
        id_product: productID,
        quantity: Quantity
    } = req.body;

    if (!userID || !productID || !Quantity) {
        return res.type('application/json').status(400).send({
            message: "Required field can not be empty",
        });
    }

    const productDetails = await getProductDetails(productID);
    if (!productDetails) return res.type('application/json').status(401).send({ message: 'product not found' });
    if (productDetails.quantity <= 0) return res.type('application/json').status(500).send({ message: `Order can't be placed : product not in stock` });

    const { total, subtotal, discount, reduction } = calculateTotal(productDetails, Quantity);
    const order = new orders({
        id_user: userID,
        id_product: productID,
        quantity: Quantity,
        reduction: reduction,
        discount: discount,
        sub_total: subtotal,
        grand_total: total
    });

    order
        .save()
        .then((data) => {
            updateProductQuantity(productDetails, Quantity);
            res.status(200).send({ ...data._doc });
        })
        .catch((err) => {
            res.type('application/json').status(500).send({
                message: 'Order canot be created',
                error: err.message
            });
        });
};

/**
 * getOrders : list the orders
 */
exports.getOrders = async (req, res, next) => {
    const { sort } = req.query;
    const orderDetails = await getOrderList(sort);
    return res.type('application/json').status(200).send({ orders: orderDetails });
}

/**
 * orderDetails : get an order
 */
exports.orderDetails = async (req, res, next) => {
    const order = await getOrderDetails(req.params.orderID);

    if (!order) return res.type('application/json').status(404).send({ message: `Order: ${req.params.orderID} not found` });
    const product = await getProductDetails(order.id_product);
    const user = await getUserDetails(order.id_user);

    let data = {
        ...order._doc,
        product: product.name,
        user: user.name,
        product_details: product,
    };
    return res.type('application/json').status(200).send(data);
}

/**
 * updateOrder : update an existing order
 */
exports.updateOrder = async (req, res, next) => {
    const newQuantity = req.body.quantity;
    if (newQuantity === 0)
        return res.status(500).send({ message: `Order can't be updated : quantity should not be zero` });

    const orderDetails = await getOrderDetails(req.params.orderID);
    if (!orderDetails)
        return res.type('application/json').status(404).send({ message: 'Order not found' });

    const productID = req.body.id_product || orderDetails.id_product;
    const Quantity = newQuantity || orderDetails.quantity;

    const productDetails = await getProductDetails(productID);

    if (!productDetails)
        return res.status(401).send({ message: `Order can't be updated : product not found` });
    if (productDetails.quantity <= 0 && newQuantity > orderDetails.quantity)
        return res.status(500).send({ message: `Order can't be updated : product not in stock` });

    const { total, subtotal, discount, reduction } = calculateTotal(productDetails, Quantity);

    const body = {
        id_product: productID,
        quantity: Quantity,
        reduction: reduction,
        discount: discount,
        sub_total: subtotal,
        grnad_total: total
    };

    let quantDiference = 0;
    if (newQuantity >= orderDetails.quantity) {
        quantDiference = newQuantity - orderDetails.quantity;
    } else {
        quantDiference = -(orderDetails.quantity - newQuantity);
    }

    orders.updateOne(
        { "_id": req.params.orderID },
        body
    )
        .then((obj) => {
            updateProductQuantity(productDetails, quantDiference);
            res.type('application/json').status(200).send({ ...body });
        })
        .catch((err) => {
            res.type('application/json').status(500).send({ message: 'Order updation failed' });
        });
};

/**
 * removeOrder : delete an existing order
 */
exports.removeOrder = (req, res, next) => {
    orders.deleteOne({ _id: req.params.orderID }, function (err) {
        if (err) return res.type('application/json').status(404).send({ message: 'cant find order' });
        res.type('application/json').status(204).send({ message: 'removed order' + req.params.orderID });
    });
}

const getUserDetails = (userID) => {
    return new Promise((resolve, sa) => {
        users.findOne({
            _id: userID
        })
            .sort({ name: -1 })
            .then((user) => {
                resolve(user);
            })
            .catch((err) => {
                resolve(user);
            });
    })
};

const getProductDetails = (productID) => {
    return new Promise((resolve, sa) => {
        Products.findOne({
            _id: productID
        })
            .sort({ name: -1 })
            .then((product) => {
                resolve(product);
            })
            .catch((err) => {
                resolve(product);
            });
    })
};

const getOrderDetails = (orderID) => {
    return new Promise((resolve, sa) => {
        orders.findOne({
            _id: orderID
        })
            .sort({ name: -1 })
            .then((order) => {
                resolve(order);
            })
            .catch((err) => {
                resolve(order);
            });
    })
};

const getOrderList = (sort) => {
    return new Promise((resolve, reject) => {
        orders.aggregate([
            {
                $lookup: {
                    from: "users", // collection name in db
                    localField: "id_user",
                    foreignField: "_id",
                    as: "user"
                },
            },
            {
                $unwind: "$user",
            },
            {
                $lookup: {
                    from: 'products',
                    localField: "id_product",
                    foreignField: "_id",
                    as: "product"
                },
            },
            {
                $unwind: "$product",
            },
        ]).exec(function (err, datas) {
            if (err) resolve(null);
            if (sort > 0) datas = datas.filter(data => data.createdAt <= moment() && moment().subtract(sort, 'day') <= data.createdAt)
            const data = datas.map((data) => {
                return {
                    ...data,
                    user: data.user.name,
                    product: data.product.name,
                    createdAt: moment(data.createdAt).format('DD-MM-YYYY hh:mm a'),
                    updatedAt: moment(data.updatedAt).format('DD-MM-YYYY hh:mm a'),
                }
            });

            resolve(data);
        });
    })
};

/**
 * calculateTotal: get reduction, discount, total amount
 */
const calculateTotal = (productDetails, Quantity) => {
    let subtotal = Quantity * productDetails.price;
    let total = subtotal;
    let discount = 0;
    let reduction = 0;
    let name = (productDetails.name).toLowerCase();

    // getDiscount;
    if (name == 'pepsi cola' && Quantity >= 3) {
        reduction = 20;
    }

    if (reduction > 0) {
        discount = (subtotal * reduction) / 100;
        total -= discount;
    }

    return {
        'subtotal': subtotal,
        'discount': discount,
        'reduction': reduction + '%',
        'total': total,
    };
};

/**
 * updateProductQuantity: update product quantity
 */
const updateProductQuantity = (productDetails, quantity) => {
    Products.updateOne(
        { "_id": productDetails._id },
        { 'quantity': productDetails.quantity - quantity }
    )
        .then((obj) => { })
        .catch((err) => { });
    return;
};
