const { User, Petugas, Kandang } = require("../../models/");
const {
  authData,
  generateAccessToken,
  clearToken,
} = require("../middlewares/auth");
const bcrypt = require("bcrypt");
const { validateUser } = require("../validators/validator");
const { Op } = require("sequelize");
const { getIdUser } = require("../Utils/helper");
const { uploadFileToSpace } = require("../middlewares/multer");
const { id } = require("date-fns/locale");

exports.signUp = async (req, res) => {
  const { nama, email, password, phone, role } = req.body;

  const validation = await validateUser({ email, password });

  if (validation.error) {
    return res.status(400).json({ success: false, message: validation.error });
  }

  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already in use",
      });
    }
    const trimmedPassword = password.trim();
    const hashedPassword = await bcrypt.hash(trimmedPassword, 10);
    const newUser = await User.create({
      nama,
      email,
      password: hashedPassword,
      no_telp: phone,
      role,
    });

    const accessToken = generateAccessToken(newUser);

    return res.status(200).json({
      success: true,
      message: "User created successfully",
      token: accessToken,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      sucess: false,
      message: "Internal server error",
    });
  }
};

exports.signIn = async (req, res) => {
  const { email, password, deviceToken } = req.body;

  try {
    const existingUser = await User.findOne({ where: { email } });
    if (!existingUser) {
      return res.status(200).json({
        success: false,
        message: "Invalid credentials",
      });
    }
    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser.password
    );
    if (!isPasswordValid) {
      return res.status(200).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const accessToken = generateAccessToken(existingUser);

    await existingUser.update({ deviceToken });

    return res.status(200).json({
      success: true,
      message: "User logged in successfully",
      token: accessToken,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.signUpPetugas = async (req, res) => {
  const { nama, email, password, phone, role, kode_pemilik } = req.body;

  const validation = await validateUser({ email, password });

  if (validation.error) {
    return res.status(400).json({ success: false, message: validation.error });
  }

  try {
    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already in use",
      });
    }

    const kodePemilik = await User.findOne({
      where: { kode_user: kode_pemilik },
    });

    if (!kodePemilik) {
      return res.status(400).json({
        success: false,
        message: "Kode pemilik tidak ditemukan",
      });
    }

    const trimmedPassword = password.trim();
    const hashedPassword = await bcrypt.hash(trimmedPassword, 10);

    const newUser = await User.create({
      nama,
      email,
      password: hashedPassword,
      no_telp: phone,
      role,
    });

    await Petugas.create({
      user_id: newUser.id,
      kode_pemilik,
    });

    const accessToken = generateAccessToken(newUser);

    return res.status(200).json({
      success: true,
      message: "User created successfully",
      token: accessToken,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      sucess: false,
      message: "Internal server error",
    });
  }
};

exports.getPetugasByOwner = async (req, res) => {
  try {
    const userId = await getIdUser(req);

    const searchTerm = req.query.nama;
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 10;

    let orders = [["createdAt", "ASC"]];

    const kodePemilik = await User.findOne({
      where: { id: userId },
    });

    const whereClause = { kode_pemilik: kodePemilik.kode_user };

    if (searchTerm) {
      whereClause.nama = { [Op.like]: `%${searchTerm}%` };
    }

    const result = await Petugas.paginate({
      page: page,
      paginate: pageSize,
      where: whereClause,
      order: orders,
      include: [
        {
          model: User,
          attributes: ["id", "nama", "email", "no_telp"],
        },
        {
          model: Kandang,
          attributes: ["id", "lokasi"],
        },
      ],
    });

    const response = {
      totalCount: result.total,
      totalPages: result.pages,
      data: result.docs.map((petugas) => {
        return {
          id: petugas.id,
          user_id: petugas.user_id,
          nama: petugas.User.nama,
          email: petugas.User.email,
          no_telp: petugas.User.no_telp,
          lokasi_kandang: petugas.Kandang.lokasi,
        };
      }),
    };

    return res.status(200).json({
      success: true,
      message: "Petugas fetched successfully",
      result: response,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.getDetailUser = async (req, res) => {
  const id = await getIdUser(req);
  try {
    const result = await User.findOne({ where: { id } });
    if (!result) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "User retrieved successfully",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Error for user with id ${id}: ${error.message}`,
    });
  }
};

exports.getDetailPetugas = async (req, res) => {
  const id = req.params.id;
  try {
    const result = await Petugas.findOne({
      where: { id },
      include: [{ model: User }, { model: Kandang }],
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Petugas not found",
      });
    }

    const response = {
      id: result.id,
      user_id: result.user_id,
      nama: result.User.nama,
      email: result.User.email,
      no_telp: result.User.no_telp,
      lokasi_kandang: result.Kandang.lokasi,
    };

    return res.status(200).json({
      success: true,
      message: "Petugas retrieved successfully",
      result: response,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Error for petugas with id ${id}: ${error.message}`,
    });
  }
};

exports.updatePetugas = async (req, res) => {
  const { id_kandang } = req.body;
  const id = req.params.id;
  try {
    const petugas = await Petugas.findOne({ where: { id } });

    if (!petugas) {
      return res.status(404).json({
        success: false,
        message: "Petugas not found",
      });
    }

    if (!id_kandang) {
      return res.status(400).json({
        success: false,
        message: "ID kandang is required",
      });
    }

    await petugas.update({ id_kandang });

    return res.status(200).json({
      success: true,
      message: "Petugas updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
