const Product = require("../product/product.model");
const Category = require("../category/category.model");
const {
  sendImageToCloudinary,
  deleteFileFromCloudinary,
} = require("../../utils/cloudnary");
const slugify = require("slugify");

const handleFileUpload = async (file) => {
  const name = file.originalname.split(".")[0];
  const result = await sendImageToCloudinary(name, file.path);
  console.log(result);
  return result.secure_url;
};

const createProduct = async (req, res, next) => {
  try {
    const {
      name,
      batch,
      description,
      disclaimers,
      benefits,
      prices,
      category,
      experiences,
      dosage,
      restrictedStates,
      expirationDate,
    } = req.body;

    if (!name || !category) {
      return res.status(400).json({
        success: false,
        message: "Name and category are required fields",
      });
    }

    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(400).json({
        success: false,
        message: "Specified category does not exist",
      });
    }

    const parsedBenefits = JSON.parse(benefits || "[]");

    const parsedPrices = JSON.parse(prices || "[]");

    const parsedExperiences = JSON.parse(experiences || "[]");

    const parsedRestrictedStates = JSON.parse(restrictedStates || "[]");

    const files = req.files || {};
    const photoFiles = Array.isArray(files.photo) ? files.photo : [];
    const coasFiles = Array.isArray(files.coas) ? files.coas : [];

    const [photoUrls, coaUrls] = await Promise.all([
      Promise.all(photoFiles.map(handleFileUpload)),
      Promise.all(coasFiles.map(handleFileUpload)),
    ]);

    const slug = slugify(name, { lower: true, strict: true });

    const existingProduct = await Product.findOne({ slug });
    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: "A product with similar name already exists",
      });
    }

    const newProduct = new Product({
      name,
      slug,
      batch,
      description,
      disclaimers,
      benefits: parsedBenefits,
      prices: parsedPrices,
      photo: photoUrls,
      category,
      experiences: parsedExperiences,
      dosage,
      coas: coaUrls,
      restrictedStates: parsedRestrictedStates,
      expirationDate,
    });

    const savedProduct = await newProduct.save();

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: savedProduct,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: Object.values(error.errors).map((err) => err.message),
      });
    }
    next(error);
  }
};

const getProducts = async (req, res, next) => {
  try {
    const {
      category,
      location,
      experience,
      dosage,
      search,
      minPrice,
      maxPrice,
      sort,
      page: pageParam,
      limit: limitParam,
    } = req.query;

    const page = parseInt(pageParam) || 1;
    const limit = parseInt(limitParam) || 10;
    const skip = (page - 1) * limit;

    let query = {};

    if (category) {
      query.category = category;
    }

    if (location && location !== "All Locations") {
      query.restrictedStates = { $nin: [location] };
    }

    if (experience) {
      const experiences = Array.isArray(experience) ? experience : [experience];
      query.experiences = { $in: experiences };
    }

    if (dosage) {
      query.dosage = dosage;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search } },
        { description: { $regex: search } },
      ];
    }

    if (minPrice || maxPrice) {
      query["prices.price"] = {};
      if (minPrice) query["prices.price"].$gte = Number(minPrice);
      if (maxPrice) query["prices.price"].$lte = Number(maxPrice);
    }

    let sortOptions = { createdAt: -1 };
    if (sort === "price-asc") {
      sortOptions = { "prices.price": 1 };
    } else if (sort === "price-desc") {
      sortOptions = { "prices.price": -1 };
    } else if (sort === "name-asc") {
      sortOptions = { name: 1 };
    } else if (sort === "name-desc") {
      sortOptions = { name: -1 };
    } else if (sort === "newest") {
      sortOptions = { createdAt: -1 };
    } else if (sort === "oldest") {
      sortOptions = { createdAt: 1 };
    }

    // if (req.query.includeExpired !== "true") {
    //   query.expirationDate = { $gt: new Date() };
    // }

    // console.log({
    //   query,
    //   page,
    //   limit,
    //   skip,
    //   sortOptions,
    // });

    const [products, total] = await Promise.all([
      Product.find(query).sort(sortOptions).skip(skip).limit(limit).lean(),
      Product.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      data: products,
      meta: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product retrieved successfully",
      data: product,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }
    next(error);
  }
};

const getProductBySlug = async (req, res, next) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug });
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product retrieved successfully",
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    let {
      name,
      batch,
      description,
      disclaimers,
      benefits,
      prices,
      category,
      experiences,
      dosage,
      restrictedStates,
      expirationDate,
      deletedPhotos, // from frontend
      deletedCoas, // from frontend
    } = req.body;

    const { id } = req.params;
    const files = req.files || {};
    const photoFiles = Array.isArray(files.photo) ? files.photo : [];
    const coasFiles = Array.isArray(files.coas) ? files.coas : [];

    // Parse if they came as JSON strings
    if (typeof deletedPhotos === "string") {
      try {
        deletedPhotos = JSON.parse(deletedPhotos);
      } catch {
        deletedPhotos = [];
      }
    }
    if (typeof deletedCoas === "string") {
      try {
        deletedCoas = JSON.parse(deletedCoas);
      } catch {
        deletedCoas = [];
      }
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Upload new files
    const [uploadedPhotos, uploadedCoas] = await Promise.all([
      Promise.all(photoFiles.map(handleFileUpload)),
      Promise.all(coasFiles.map(handleFileUpload)),
    ]);

    // Parse incoming arrays
    const parsedBenefits = JSON.parse(benefits || "[]");
    const parsedPrices = prices ? JSON.parse(prices) : [];
    const parsedExperiences = JSON.parse(experiences || "[]");
    const parsedRestrictedStates = Array.isArray(restrictedStates)
      ? restrictedStates
      : restrictedStates
      ? JSON.parse(restrictedStates)
      : undefined;

    // Handle deletion of photos
    let updatedPhotos = product.photo || [];
    if (Array.isArray(deletedPhotos) && deletedPhotos.length > 0) {
      updatedPhotos = updatedPhotos.filter(
        (url) => !deletedPhotos.includes(url)
      );
      await Promise.all(deletedPhotos.map(deleteFileFromCloudinary));
    }

    // Handle deletion of COAs
    let updatedCoas = product.coas || [];
    if (Array.isArray(deletedCoas) && deletedCoas.length > 0) {
      updatedCoas = updatedCoas.filter((url) => !deletedCoas.includes(url));
      await Promise.all(deletedCoas.map(deleteFileFromCloudinary));
    }

    // Add new uploads
    if (uploadedPhotos.length > 0) updatedPhotos.push(...uploadedPhotos);
    if (uploadedCoas.length > 0) updatedCoas.push(...uploadedCoas);

    // Prepare update data
    const updateData = {
      ...(name && { name }),
      ...(name && { slug: slugify(name, { lower: true, strict: true }) }),
      ...(batch && { batch }),
      ...(description && { description }),
      ...(disclaimers && { disclaimers }),
      ...(parsedBenefits && { benefits: parsedBenefits }),
      ...(parsedPrices && { prices: parsedPrices }),
      ...(category && { category }),
      ...(parsedExperiences && { experiences: parsedExperiences }),
      ...(dosage && { dosage }),
      ...(parsedRestrictedStates && {
        restrictedStates: parsedRestrictedStates,
      }),
      ...(expirationDate && { expirationDate }),
      photo: updatedPhotos,
      coas: updatedCoas,
    };

    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: updatedProduct,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: Object.values(error.errors).map((err) => err.message),
      });
    }
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
      data: { id: product._id, name: product.name },
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }
    next(error);
  }
};

const deleteProductImage = async (req, res, next) => {
  try {
    const { id, imageUrl } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    product.photo = product.photo.filter((photo) => photo !== imageUrl);
    await product.save();

    res.status(200).json({
      success: true,
      message: "Image deleted successfully",
      data: product.photo,
    });
  } catch (error) {
    next(error);
  }
};

const deleteProductCoa = async (req, res, next) => {
  try {
    const { id, coaUrl } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    product.coas = product.coas.filter((coa) => coa !== coaUrl);
    await product.save();

    res.status(200).json({
      success: true,
      message: "COA deleted successfully",
      data: product.coas,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  deleteProductImage,
  deleteProductCoa,
};
