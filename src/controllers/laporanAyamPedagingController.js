const {
  LaporanPanenAyamPedagingSampling,
  LaporanPanenAyamPedagingSamplingImage,
  Kandang,
  User,
  LaporanPanenAyamPedagingManual,
  LaporanPanenAyamPedagingManualImage,
} = require("../../models/");
const { Op, where, Sequelize, fn, literal, col } = require("sequelize");
const jwt = require("jsonwebtoken");
const { getIdUser } = require("../utils/helper");
const {
  uploadFileToSpace,
  deleteFileFromSpace,
} = require("../middlewares/multer");
const { config } = require("dotenv");

config();

exports.createLaporanAyamPedagingSampling = async (req, res) => {
  const { id_kandang, jumlah, tanggal } = req.body;
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const userId = await getIdUser(req);

    const newLaporanAyamPedagingSampling =
      await LaporanPanenAyamPedagingSampling.create({
        id_kandang,
        tanggal: tanggal,
        total_berat: jumlah,
        createdBy: userId,
      });

    const uploadedImages = [];

    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      const fileName = `Ayam-Pedaging-${Date.now()}-${file.originalname.trim()}`;

      const uploadResult = await uploadFileToSpace(
        file.buffer,
        fileName,
        "Ayam Pedaging"
      );
      uploadedImages.push(uploadResult);
    }

    for (let i = 0; i < uploadedImages.length; i++) {
      await LaporanPanenAyamPedagingSamplingImage.create({
        id_laporan_panen_ayam_pedaging_sampling:
          newLaporanAyamPedagingSampling.id,
        url: uploadedImages[i],
      });
    }

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

exports.getDetailLaporanPanenAyamPedagingSampling = async (req, res) => {
  const { id } = req.params;
  try {
    const laporanPanenAyamPedagingSampling =
      await LaporanPanenAyamPedagingSampling.findOne({
        where: { id },
        include: [
          {
            model: User,
            attributes: ["id", "nama", "email", "no_telp"],
          },
        ],
      });

    if (!laporanPanenAyamPedagingSampling) {
      return res.status(404).json({
        success: false,
        message: "Laporan kematian ayam not found",
      });
    }

    const images = await LaporanPanenAyamPedagingSamplingImage.findAll({
      where: { id_laporan_panen_ayam_pedaging_sampling: id },
    });

    const response = {
      id: laporanPanenAyamPedagingSampling.id,
      total_ayam: 10,
      berat_ayam: laporanPanenAyamPedagingSampling.total_berat,
      status: laporanPanenAyamPedagingSampling.status,
      tanggal: laporanPanenAyamPedagingSampling.tanggal,
      status: laporanPanenAyamPedagingSampling.status,
      createdBy: laporanPanenAyamPedagingSampling.User.nama,
      images: images.map((image) => image.url),
      createdAt: laporanPanenAyamPedagingSampling.createdAt,
      updatedAt: laporanPanenAyamPedagingSampling.updatedAt,
    };

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

exports.updateStatusLaporanPanenAyamPedaging = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    let laporanPanenAyamPedagingSampling =
      await LaporanPanenAyamPedagingSampling.findOne({
        where: { id },
      });

    if (laporanPanenAyamPedagingSampling) {
      laporanPanenAyamPedagingSampling.status = status;
      await laporanPanenAyamPedagingSampling.save();

      return res.status(200).json({
        success: true,
        message: "Status berhasil diubah",
      });
    }

    let laporanPanenAyamPedagingManual =
      await LaporanPanenAyamPedagingManual.findOne({
        where: { id },
      });

    if (laporanPanenAyamPedagingManual) {
      laporanPanenAyamPedagingManual.status = status;
      await laporanPanenAyamPedagingManual.save();

      return res.status(200).json({
        success: true,
        message: "Status berhasil diubah",
      });
    }

    return res.status(404).json({
      success: false,
      message: "Laporan panen ayam pedaging not found",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
