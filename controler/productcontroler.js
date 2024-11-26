const { model } = require('mongoose');
const Product = require('../model/products');
const Purchase = require('../model/purchase');
const { ObjectId } = require('mongodb');

module.exports.product_post = (req, res) => {
    const product = new Product(req.body);

    product.save()
        .then(savedProduct => {
            res.status(201).json(savedProduct);
        })
        .catch(error => {
            console.error('Error saving product:', error);
            res.status(500).json({ error: 'Failed to save product' });
        });
    console.log('product added');
}
module.exports.product_get = (req, res) => {
    console.log(req.url);
    Product.find()
        .then(products => {
            res.status(200).json(products);
        })
        .catch(error => {
            console.error('Error fetching products:', error);
            res.status(500).json({ error: 'Failed to fetch products' });
        });
}
module.exports.productdetails_get = (req, res) => {
    console.log("inside product details", req.url);
    const id = req.params.productid;

    Product.findById(id)
        .then((result) => {
            console.log(result)
            res.status(200).json(result);
        })
        .catch((err) => {
            console.log(err);
        });
}

exports.createPurchase_post = (req, res) => {
    // Extract data from the request body
    console.log(req.body);
    const { userId, productId, totalPrice, quantity,transactionID,duration} = req.body;
    console.log(userId, productId, totalPrice, quantity,transactionID,duration);
    currentDate = new Date();
    console.log(currentDate);
    let endDate = new Date(currentDate);
    endDate.setMonth(currentDate.getMonth() + duration);
    console.log(endDate);

    // Create a new purchase record
    const purchase = new Purchase({
        user: userId,
        product: productId,
        totalPrice,
        quantity,
        transactionID,
        duration,
        endDate
    });

    // Save the purchase record to the database
    purchase.save()
        .then((savedPurchase) => {
            res.status(201).json({ message: 'Purchase created successfully', purchase: savedPurchase });
        })
        .catch((error) => {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        });
};
exports.createPurchase_get = (req, res) => {
    const authHeader = req.headers.authorization;
// console.log("form data",authHeader);
if (authHeader) {
    const user = authHeader.split(' ')[1];
    console.log("UserID extracted from Authorization Header:", user);
    Purchase.find({user})
    .populate('product')
    .then((result) => {
        if (!result) {
            return res.status(404).json({ error: 'Purchase not found' });
        }
        // console.log("Purchase Document:", result);
        
        res.status(200).json(result);
    })
    .catch((err) => {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    });
    console.log("Inside create purchase for user ID:", user);
}
}
