const { LaporanPanenTelur, User, Kandang } = require("../../models/");
const { Op, where, Sequelize, fn, literal, col } = require("sequelize");
const { getIdUser } = require("../utils/helper");
const { config } = require("dotenv");

config();

exports.createLaporanPanenTelur = async (req, res) => {
  const { id_kandang, jumlah, tanggal } = req.body;
  try {
    const userId = await getIdUser(req);

    await LaporanPanenTelur.create({
      id_kandang,
      tanggal: tanggal,
      jumlah_telur: jumlah,
      createdBy: userId,
    });

    return res.status(200).json({
      success: true,
      message: "Laporan kematian ayam created successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.getDetailLaporanPanenTelur = async (req, res) => {
  const { id } = req.params;
  try {
    const laporanPanenTelur = await LaporanPanenTelur.findOne({
      where: { id },
      include: [
        {
          model: User,
          attributes: ["id", "nama", "email", "no_telp"],
        },
      ],
    });

    if (!laporanPanenTelur) {
      return res.status(404).json({
        success: false,
        message: "Laporan kematian ayam not found",
      });
    }

    const kandang = await Kandang.findOne({ where: { id: laporanPanenTelur.id_kandang } });

    const response = {
        id: laporanPanenTelur.id,
        total_ayam: kandang.jumlah_ayam,
        telur: laporanPanenTelur.jumlah_telur,
        tanggal: laporanPanenTelur.tanggal,
        status: laporanPanenTelur.status,
        createdBy: laporanPanenTelur.User.nama,
        createdAt: laporanPanenTelur.createdAt,
        updatedAt: laporanPanenTelur.updatedAt,
    }

    return res.status(200).json({
      success: true,
      message: "Laporan kematian ayam found successfully",
      data: response,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.updateStatusLaporanPanenTelur = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const laporanPanenTelur = await LaporanPanenTelur.findOne({
      where: { id },
    });

    if (!laporanPanenTelur) {
      return res.status(404).json({
        success: false,
        message: "Laporan panen telur not found",
      });
    }

    laporanPanenTelur.status = status;
    await laporanPanenTelur.save();

    return res.status(200).json({
      success: true,
      message: "Laporan panen telur updated successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
