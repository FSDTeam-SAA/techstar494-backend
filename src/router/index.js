const { Router } = require("express");
const userRouter = require("../modules/user/user.router");
const authRouter = require("../modules/auth/auth.router");
const sendMessageRouter = require("../modules/contract/contract.router");
const productRouter = require("../modules/product/product.router");
const orderRouter = require("../modules/order/order.router");
const cartRouter = require("../modules/cart/cart.router");
const blogRouter = require("../modules/blog/blog.router");
const privacyRouter = require("../modules/privacy/privacy.router");

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
    path: "/order",
    router: orderRouter,
  },
  {
    path: "/cart",
    router: cartRouter,
  },

  {
    path: "/blog",
    router: blogRouter,
  },
  {
    path: "/privacy",
    router: privacyRouter,
  },
];

moduleRouter.forEach((route) => {
  router.use(route.path, route.router);
});

module.exports = router;
