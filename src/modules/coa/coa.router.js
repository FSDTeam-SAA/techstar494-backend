const express = require("express");
const router = express.Router();
const { upload } = require("../../utils/cloudnary");
const {
    getAllCategoriesWithCoas,
    reuploadCoa,
    deleteCoa,
} = require("../coa/coa.controller");

router.get("/", getAllCategoriesWithCoas);

router.put("/:productId/:coaIndex/reupload", upload.single("file"), reuploadCoa);

router.delete("/:productId/:coaIndex", deleteCoa);

module.exports = router;
