/**
 * Controller : Products
 */

const Products = require("../adapters/products");

/**
 * createProduct : create an product
 */
exports.createProduct = (req, res, next) => {
    if (!req.body.name || !req.body.price || !req.body.quantity) {
        return res.status(400).send({
            message: "Required field can not be empty",
        });
    } else {

        const product = new Products({
            name: req.body.name,
            price: req.body.price,
            quantity: req.body.quantity
        });

        product
            .save()
            .then((data) => {
                res.send(data);
            })
            .catch((err) => {
                res.status(500).send({
                    message: err.message || "Some error occurred while creating the product.",
                });
            });
    }
};

/**
 * getProducts : list the products
 */
exports.getProducts = (req, res, next) => {
    const {
        quantity: Quantity
    } = req.query;

    Products.find(
        Quantity && {
            quantity: { $gt: Quantity },
        })
        .sort({ name: -1 })
        .then((products) => {
            return res.status(200).send({ 'products': products });
        })
        .catch((err) => {
            return res.status(500).send({ 'products': null });
        });
}
