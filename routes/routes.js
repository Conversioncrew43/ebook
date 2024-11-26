
const { Router } = require('express');
const authcontroler = require('../controler/authcontroler');
const productcontroler = require('../controler/productcontroler');
const blogcontroler = require('../controler/blogcontroler');
const router = Router();

router.get('/display',authcontroler.display_get);
router.post('/register',authcontroler.register_post);
router.post('/login',authcontroler.login_post);
router.get('/userdetail',authcontroler.display_user);
router.get('/products',productcontroler.product_get);
router.post('/add-product',productcontroler.product_post);
router.get('/product/:productid', productcontroler.productdetails_get)
router.post('/purchase', productcontroler.createPurchase_post);
router.get('/purchase', productcontroler.createPurchase_get);
router.get('/blogs',blogcontroler.get_blogs);
router.post('/add-blogs',blogcontroler.post_blog);
router.get('/blog-details/:id',blogcontroler.get_blog);




module.exports = router;