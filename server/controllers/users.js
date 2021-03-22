/**
 * Controller : user
 */

const Users = require("../adapters/users");

/**
 * createUser : create an user
 */
exports.createuser = (req, res, next) => {
    if (!req.body.name) {
        return res.status(400).send({
            message: "Required field can not be empty",
        });
    }

    const user = new Users({
        name: req.body.name,
    });

    user
        .save()
        .then((data) => {
            res.status(200).send({ user: data });
        })
        .catch((err) => {
            res.status(500).send({
                message: err.message || "Some error occurred while creating the User.",
            });
        });
};

/**
 * getOrders : list the orders
 */
exports.getUsers = (req, res, next) => {
    Users.find()
    .sort({ name: -1 })
    .then((users) => {
      res.status(200).send(users);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Error Occured",
      });
    });
}
