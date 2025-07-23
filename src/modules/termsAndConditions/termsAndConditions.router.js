const { Router } = require("express");
const { createTermsAndConditions } = require("./termsAndConditions.controller");

const router = Router();

router.post("/create", createTermsAndConditions);


const termsAndConditionsRouter = router;
module.exports = termsAndConditionsRouter;
