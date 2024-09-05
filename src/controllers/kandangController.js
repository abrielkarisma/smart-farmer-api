const { Kandang, KandangImage, User } = require("../../models/");
const { Op, where, Sequelize, fn, literal, col } = require("sequelize");
const jwt = require("jsonwebtoken");
const { getIdUser } = require("../utils/helper");
const {
  uploadFileToSpace,
  deleteFileFromSpace,
} = require("../middlewares/multer");
const { config } = require("dotenv");

config();

exports.createKandang = async (req, res) => {
  const { nama, lokasi, latitude, longitude, jumlah_ayam } = req.body;
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const userId = await getIdUser(req);
    console.log(userId);

    const newKandang = await Kandang.create({
      nama,
      lokasi,
      latitude,
      longitude,
      id_pemilik: userId,
      jumlah_ayam,
    });

    const uploadedImages = [];

    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      const fileName = `Kandang-${Date.now()}-${file.originalname}`;

      const uploadResult = await uploadFileToSpace(
        file.buffer,
        fileName,
        "Kandang"
      );
      uploadedImages.push(uploadResult);
    }

    for (let i = 0; i < uploadedImages.length; i++) {
      await KandangImage.create({
        url: uploadedImages[i],
        id_kandang: newKandang.id,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Kandang created successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      sucess: false,
      message: "Internal server error",
    });
  }
};

exports.getAllKandangById = async (req, res) => {
  try {
    const userId = await getIdUser(req);

    const searchTerm = req.query.nama;
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 10;

    let orders = [["createdAt", "ASC"]];

    const whereClause = { id_pemilik: userId, isDeleted: false };
    if (searchTerm) {
      whereClause.nama = { [Op.like]: `%${searchTerm}%` };
    }

    const result = await Kandang.paginate({
      attributes: [
        "id",
        "nama",
        "lokasi",
        "latitude",
        "longitude",
        "jumlah_ayam",
      ],
      page: page,
      paginate: pageSize,
      where: whereClause,
      order: orders,
    });

    result.docs.forEach((Kandang) => {
      console.log("Kandang dataValues:", Kandang.dataValues);
    });

    const response = {
      totalCount: result.total,
      totalPages: result.pages,
      data: result.docs,
    };

    if (result.docs.length === 0) {
      return res.status(200).json({
        success: false,
        message: "Kandang not added yet",
        result: response,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Kandang retrieved successfully",
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

exports.getDetailKandang = async (req, res) => {
  const id = req.params.id;
  try {
    const result = await Kandang.findOne({
      where: { id },
      include: [
        {
          model: KandangImage,
          attributes: ["url"],
        },
      ],
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Kandang not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Kandang retrieved successfully",
      data: result,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.updateKandang = async (req, res) => {
    const { id } = req.params;
    const {
      nama,
      lokasi,
      latitude,
      longitude,
      jumlah_ayam,
      deletedImagesId = "",
    } = req.body;

    try {
      const deletedImagesArray = deletedImagesId
        ? deletedImagesId.split(",")
        : [];

      const existingKandang = await Kandang.findOne({ where: { id } });
      if (!existingKandang) {
        return res.status(404).json({
          success: false,
          message: "Kandang not found",
        });
      }

      if (nama) existingKandang.nama = nama;
      if (lokasi) existingKandang.location = location;
      if (latitude) existingKandang.latitude = latitude;
      if (longitude) existingKandang.longitude = longitude;
      if (jumlah_ayam) existingKandang.jumlah_ayam = jumlah_ayam;

      if (deletedImagesArray.length > 0) {
        const KandangImages = await KandangImage.findAll({ where: { id_kandang: id } });

        if (!KandangImages) {
          return res.status(404).json({
            success: false,
            message: "Kandang images not found",
          });
        }

        for (let i = 0; i < deletedImagesArray.length; i++) {
          const img = await KandangImage.findOne({
            where: { id: deletedImagesArray[i] },
          });
          if (img) {
            const fileKey = img.image.split("/").pop();
            await deleteFileFromSpace(fileKey, "Kandang");
            await img.destroy();
          }
        }
      }

      const uploadedImages = [];

      if (req.files && req.files.length > 0) {
        for (let i = 0; i < req.files.length; i++) {
          const file = req.files[i];
          const fileName = `Kandang-${Date.now()}-${file.originalname}`;

          const uploadResult = await uploadFileToSpace(
            file.buffer,
            fileName,
            "Kandang"
          );
          uploadedImages.push(uploadResult);
        }

        for (let i = 0; i < uploadedImages.length; i++) {
          await image.create({
            image: uploadedImages[i],
            KandangId: id,
          });
        }
      }

      await existingKandang.save();

      return res.status(200).json({
        success: true,
        message: "Kandang updated successfully",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
};

exports.deleteKandang = async (req, res) => {
    const { id } = req.params;
    try {
      const existingKandang = await Kandang.findOne({ where: { id } });
      if (!existingKandang) {
        return res.status(404).json({
          success: false,
          message: "Kandang not found",
        });
      }
      await existingKandang.update({ isDeleted: true });
      return res.status(200).json({
        success: true,
        message: "Kandang deleted successfully",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
};