const { User, Petugas, Kandang, sequelize } = require("../../models/");
const {
  authData,
  generateAccessToken,
  clearToken,
} = require("../middlewares/auth");
const bcrypt = require("bcrypt");
const { validateUser } = require("../validators/validator");
const { Op, where } = require("sequelize");
const { uploadFileToSpace } = require("../middlewares/multer");
const { id } = require("date-fns/locale");
const { getIdUser } = require("../utils/helper");

exports.signUp = async (req, res) => {
  const { nama, email, password, phone, role } = req.body;

  const validation = await validateUser({ email, password });

  if (validation.error) {
    return res.status(400).json({ success: false, message: validation.error });
  }

  const transaction = await sequelize.transaction();
  
  try {
    const existingUser = await User.findOne({ where: { email } }, { transaction });
    if (existingUser) {
      await transaction.rollback();
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
    }, { transaction });

    if(newUser.role == 'pemilik'){
      await Kandang.create(
        {
          nama: "Kandang Baru",
          lokasi: "Indonesia",
          latitude: 0,
          longitude: 0,
          id_pemilik: newUser.id,
          jumlah_ayam: 0,
        },
        { transaction }
      );
    }

    const accessToken = generateAccessToken(newUser);

    await transaction.commit();
    
    return res.status(200).json({
      success: true,
      message: "User created successfully",
      token: accessToken,
    });
  } catch (error) {
    console.log(error);
    await transaction.rollback();
    return res.status(500).json({
      success: false,
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
      role: existingUser.role,
    });
  } catch (error) {
    console.log(error);
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

exports.getKodeOwner = async (req, res) => {
  try{
    const userId = await getIdUser(req);

    const user = await User.findOne({ where: { id: userId } });

    return res.status(200).json({
      success: true,
      message: "Kode pemilik fetched successfully",
      data: user.kode_user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
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
    const searchName = {}

    if (searchTerm) {
      searchName.nama = { [Op.like]: `%${searchTerm}%` };
    }

    const result = await Petugas.paginate({
      page: page,
      paginate: pageSize,
      order: orders,
      where: whereClause, 
      include: [
        {
          model: User,
          attributes: ["id", "nama", "email", "no_telp"],
          where: searchName,
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
          userId: petugas.user_id,
          nama: petugas.User.nama,
          email: petugas.User.email,
          noTelp: petugas.User.no_telp,
          lokasiKandang: petugas.id_kandang !== null ? petugas.Kandang.lokasi : "Belum ditentukan",
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
      userId: result.user_id,
      nama: result.User.nama,
      email: result.User.email,
      noTelp: result.User.no_telp,
      lokasiKandang: result.id_kandang == null ? "Belum ditentukan" : result.Kandang.lokasi,
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
