const Product = require("../product/product.model");
const { sendImageToCloudinary, upload } = require("../../utils/cloudnary");

const handleFileUpload = async (file) => {
  const result = await sendImageToCloudinary(file.filename, file.path);
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
    } = req.body;

    const parsedBenefits = benefits?.split(",") || [];
    const parsedPrices = JSON.parse(prices || "[]");
    const parsedExperiences = experiences?.split(",") || [];
    const parsedRestrictedStates = JSON.parse(restrictedStates || "[]");

    // Handle multiple file uploads
    const files = req.files;
    const photoUrls = files?.photo
      ? await Promise.all(files.photo.map(handleFileUpload))
      : [];

    const coaUrls = files?.coas
      ? await Promise.all(files.coas.map(handleFileUpload))
      : [];

    const newProduct = new Product({
      name,
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
    });

    const savedProduct = await newProduct.save();

    res.status(200).json({
      success: true,
      message: "Product created successfully",
      data: savedProduct,
    });
  } catch (error) {
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
      query.location = location;
    }

    if (experience) {
      const experiences = Array.isArray(experience) ? experience : [experience];
      query.experiences = { $in: experiences };
    }

    if (dosage) {
      query.dosage = dosage;
    }

    if (search) {
      query.name = { $regex: search, $options: "i" };
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
    }

    const [products, total] = await Promise.all([
      Product.find(query).sort(sortOptions).skip(skip).limit(limit),
      Product.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      data: products,
      count: products.length,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      success: true,
      message: "Product get successfully",
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
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
    } = req.body;

    const { id } = req.params;
    const files = req.files || {};
    const photoFiles = Array.isArray(files.photo) ? files.photo : [];
    const coasFiles = Array.isArray(files.coas) ? files.coas : [];

    const product = await Product.findById(id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    // Upload new photo files if provided
    let uploadedPhotos = [];
    for (const file of photoFiles) {
      const secure_url = await handleFileUpload(file);
      uploadedPhotos.push(secure_url);
    }

    // Upload new COAs if provided
    let uploadedCoas = [];
    for (const file of coasFiles) {
      const secure_url = await handleFileUpload(file);
      uploadedCoas.push(secure_url);
    }

    // Safely parse incoming data
    const parsedBenefits = Array.isArray(benefits)
      ? benefits
      : benefits?.split(",") || undefined;

    const parsedPrices = prices
      ? Array.isArray(prices)
        ? prices
        : JSON.parse(prices)
      : undefined;

    const parsedExperiences = Array.isArray(experiences)
      ? experiences
      : experiences?.split(",") || undefined;

    const parsedRestrictedStates = restrictedStates
      ? JSON.parse(restrictedStates)
      : undefined;

    // Build the update object dynamically
    const updateData = {
      ...(name && { name }),
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
    };

    if (uploadedPhotos.length > 0) {
      updateData.photo = uploadedPhotos;
    }

    if (uploadedCoas.length > 0) {
      updateData.coas = uploadedCoas;
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: updatedProduct,
    });
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    await Product.findByIdAndDelete(id);
    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
