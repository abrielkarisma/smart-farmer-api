const { LaporanKematianAyam, User, Kandang } = require("../../models/");
const { Op, where, Sequelize, fn, literal, col } = require("sequelize");
const { getIdUser } = require("../utils/helper");
const {
  uploadFileToSpace,
  deleteFileFromSpace,
} = require("../middlewares/multer");
const { config } = require("dotenv");

config();

exports.createLaporanKematianAyam = async (req, res) => {
  const { id_kandang, keterangan, jumlah } = req.body;
  try {
    const userId = await getIdUser(req);

    const dateNow = Date.now();

    const newLaporanKematianAyam = await LaporanKematianAyam.create({
      id_kandang,
      tanggal: dateNow,
      keterangan,
      jumlah,
      createdBy: userId,
    });

    return res.status(200).json({
      success: true,
      message: "Laporan kematian ayam created successfully",
      data: newLaporanKematianAyam,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.getDetailLaporanKematianAyam = async (req, res) => {
  const { id } = req.params;
  try {
    const laporanKematianAyam = await LaporanKematianAyam.findOne({
      where: { id },
    });

    if (!laporanKematianAyam) {
      return res.status(404).json({
        success: false,
        message: "Laporan kematian ayam not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Laporan kematian ayam found successfully",
      data: laporanKematianAyam,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.updateStatusLaporanKematianAyam = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const laporanKematianAyam = await LaporanKematianAyam.findOne({
      where: { id },
    });

    if (!laporanKematianAyam) {
      return res.status(404).json({
        success: false,
        message: "Laporan kematian ayam not found",
      });
    }

    const kandang = await Kandang.findOne({
      where: { id: laporanKematianAyam.id_kandang },
    });

    laporanKematianAyam.status = status;

    if (status === "approved") {
      kandang.update({
        jumlah_ayam: kandang.jumlah_ayam - laporanKematianAyam.jumlah,
      });
    }

    await laporanKematianAyam.save();

    return res.status(200).json({
      success: true,
      message: "Laporan kematian ayam updated successfully",
      data: laporanKematianAyam,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
