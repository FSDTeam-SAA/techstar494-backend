const { Router } = require("express");
const userRouter = require("../modules/user/user.router");
const authRouter = require("../modules/auth/auth.router");
const sendMessageRouter = require("../modules/contract/contract.router");
const productRouter = require("../modules/product/product.router");
const categoryRouter = require("../modules/category/category.router");
const orderRouter = require("../modules/order/order.router");
const cartRouter = require("../modules/cart/cart.router");
const blogRouter = require("../modules/blog/blog.router");
const couponMakingRouter = require("../modules/couponMaking/couponMaking.router");
const paymentRouter = require("../modules/payment/payment.router");
const FaqRouter = require("../modules/faq/faq.router");
const fdaDisclaimerRouter = require("../modules/fdaDisclaimer/fdaDisclaimer.router");
const legalDocumentsRouter = require("../modules/legalDocuments/legalDocuments.router");
const subscriberRouter = require("../modules/subscriber/subscriber.router");
const PromotionRouter = require("../modules/promotions/promotions.router");
const coaRouter = require("../modules/coa/coa.router");
const dashboardRouter = require("../modules/dashboard/dashboard.router");

const router = Router();

const moduleRouter = [
  {
    path: "/user",
    router: userRouter,
  },
  {
    path: "/auth",
    router: authRouter,
  },
  {
    path: "/contract",
    router: sendMessageRouter,
  },
  {
    path: "/products",
    router: productRouter,
  },
  {
    path: "/category",
    router: categoryRouter,
  },
  {
    path: "/order",
    router: orderRouter,
  },
  {
    path: "/cart",
    router: cartRouter,
  },
  {
    path: "/faq",
    router: FaqRouter,
  },
  {
    path: "/fadDisclaimer",
    router: fdaDisclaimerRouter,
  },
  {
    path: "/legal-documents",
    router: legalDocumentsRouter,
  },
  {
    path: "/blog",
    router: blogRouter,
  },
  {
    path: "/coupon-making",
    router: couponMakingRouter,
  },
  {
    path: "/payment",
    router: paymentRouter,
  },
  {
    path: "/subscriber",
    router: subscriberRouter,
  },
  {
    path: "/promotions",
    router: PromotionRouter,
  },
  {
    path: "/coas",
    router: coaRouter,
  },
  {
    path: "/dashboard",
    router: dashboardRouter,
  },
];

moduleRouter.forEach((route) => {
  router.use(route.path, route.router);
});

module.exports = router;
