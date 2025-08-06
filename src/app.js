const express = require("express");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const globalErrorHandler = require("./middleware/globalErrorHandler");
const notFound = require("./middleware/notFound");
const router = require("./router");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const corsOptions = {
  origin: "*",
  credentials: true,
};

app.use(cors(corsOptions));
app.use(cookieParser());

app.use("/api/v1", router);

app.use("/", (req, res) => {
  return res.send("Your server is running!");
});

app.use(globalErrorHandler);
app.use(notFound);

module.exports = app;

//TODO: vai apnar ja kaj korcan tar api test postman document a nai ektu add kore deyan.
//TODO: legalDocuments isue ache create and postman a check kore deyan. ami kecu code add kore dicee, [upsertDocument] if else condition add kore deyan.
