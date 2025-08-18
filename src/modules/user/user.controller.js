const { StatusCodes } = require("http-status-codes");
const config = require("../../config");
const userService = require("./user.service");

const createNewAccount = async (req, res) => {
  try {
    const result = await userService.createNewAccountInDB(req.body);

    const { refreshToken, accessToken, user } = result;
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: config.NODE_ENV === "production",
      sameSite: config.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      code: 200,
      message: "User created successfully, please verify your email",
      data: {
        accessToken,
        user,
      },
    });
  } catch (error) {
    return res
      .status(400)
      .json({ success: false, code: 400, message: error.message });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { email } = req.user;
    const result = await userService.verifyUserEmail(req.body, email);
    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const resendOtpCode = async (req, res) => {
  try {
    const result = await userService.resendOtpCode(req.user);

    return res.status(200).json({
      success: true,
      message: "OTP resent successfully",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

// const getAllUsers = async (req, res) => {
//   try {
//     const { search, filter } = req.query;
//     const users = await userService.getAllUsersFromDb(search, filter);

//     return res.status(200).json({
//       success: true,
//       message: "Users retrieved successfully",
//       data: users,
//     });
//   } catch (error) {
//     return res.status(400).json({ success: false, message: error.message });
//   }
// };


const getAllUsers = async (req, res) => {
  try {
    const { search, filter, page = 1, limit = 10 } = req.query;

    const { users, total } = await userService.getAllUsersFromDb(
      search,
      filter,
      parseInt(page, 10),
      parseInt(limit, 10)
    );

    return res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      data: users,
      meta: {
        total,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};



const getMyProfile = async (req, res) => {
  try {
    const { email } = req.user;
    const user = await userService.getMyProfileFromDb({ email });

    return res.status(200).json({
      success: true,
      message: "User profile retrieved successfully",
      data: user,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const { email } = req.user;
    const result = await userService.updateUserProfile(
      req.body,
      email,
      req.file
    );

    return res.status(200).json({
      success: true,
      message: "User profile updated successfully",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const deleteUserProfile = async (req, res) => {
  try {
    const { email } = req.user;
    const result = await userService.deleteUserProfile(email);

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Your profile has been deleted successfully",
      data: result,
    });
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: error.message });
  }
};

const userController = {
  createNewAccount,
  verifyEmail,
  resendOtpCode,
  getAllUsers,
  getMyProfile,
  updateUserProfile,
  deleteUserProfile,
};

module.exports = userController;
