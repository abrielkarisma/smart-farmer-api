const {
  Inventory,
  LogInventory,
  InventoryImage,
  User,
  Kandang,
  Petugas,
} = require("../../models/");
const { Op, where } = require("sequelize");
const { uploadFileToSpace } = require("../middlewares/multer");
const { getIdUser } = require("../utils/helper");
const { id } = require("date-fns/locale");

exports.createInventory = async (req, res) => {
  const { name, stock, jenis, id_kandang } = req.body;

  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const newInventory = await Inventory.create({
      name,
      stock,
      jenis,
      id_kandang,
    });

    const uploadedImages = [];

    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      const fileName = `Inventory-${Date.now()}-${file.originalname.trim()}`;

      const uploadResult = await uploadFileToSpace(
        file.buffer,
        fileName,
        "Inventory"
      );
      uploadedImages.push(uploadResult);
    }

    for (let i = 0; i < uploadedImages.length; i++) {
      await InventoryImage.create({
        url: uploadedImages[i],
        id_inventory: newInventory.id,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Inventory created successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      sucess: false,
      message: "Internal server error",
    });
  }
};

exports.getInventoryByKandang = async (req, res) => {
  try {
    const searchTerm = req.query.name;
    const searchCategory = req.query.jenis;
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 10;

    let order = [["name", "ASC"]];

    const whereClause = { id_kandang: req.params.id, isDeleted: false };

    if (searchTerm) {
      whereClause.name = { [Op.like]: `%${searchTerm}%` };
      order = [];
    }

    if (searchCategory) {
      whereClause.jenis = { [Op.like]: `%${searchCategory}%` };
      order = [];
    }

    const result = await Inventory.paginate({
      page: page,
      paginate: pageSize,
      where: whereClause,
      order: order,
    });

    if (result.docs.length === 0) {
      return res.status(200).json({
        success: false,
        message: "Inventory not found",
        result: { totalCount: 0, totalPages: 0, data: [] },
      });
    }

    const inventoryIds = result.docs.map((inventory) => inventory.id);
    const images = await InventoryImage.findAll({
      where: { id_inventory: inventoryIds },
      attributes: ["id_inventory", "url"],
    });

    const inventoryWithImages = result.docs.map((inventory) => {
      const inventoryImages = images
        .filter((image) => image.id_inventory === inventory.id)
        .map((image) => ({ url: image.url }));
      return {
        ...inventory.toJSON(),
        images: inventoryImages,
      };
    });

    const response = {
      totalCount: result.total,
      totalPages: result.pages,
      data: inventoryWithImages,
    };

    return res.status(200).json({
      success: true,
      message: "Inventory retrieved successfully",
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

exports.getInventoryByPetugas = async (req, res) => {
  try {
    const searchTerm = req.query.name;
    const searchCategory = req.query.jenis;
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 10;

    const userId = await getIdUser(req);

    const petugas = await Petugas.findOne({ where: { user_id: userId } });

    let order = [["name", "ASC"]];

    const whereClause = { id_kandang: petugas.id_kandang, isDeleted: false };

    if (searchTerm) {
      whereClause.name = { [Op.like]: `%${searchTerm}%` };
      order = [];
    }

    if (searchCategory) {
      whereClause.jenis = { [Op.like]: `%${searchCategory}%` };
      order = [];
    }

    const result = await Inventory.paginate({
      page: page,
      paginate: pageSize,
      where: whereClause,
      order: order,
    });

    if (result.docs.length === 0) {
      return res.status(200).json({
        success: false,
        message: "Inventory not found",
        result: { totalCount: 0, totalPages: 0, data: [] },
      });
    }

    const inventoryIds = result.docs.map((inventory) => inventory.id);
    const images = await InventoryImage.findAll({
      where: { id_inventory: inventoryIds },
      attributes: ["id_inventory", "url"],
    });

    const inventoryWithImages = result.docs.map((inventory) => {
      const inventoryImages = images
        .filter((image) => image.id_inventory === inventory.id)
        .map((image) => ({ url: image.url }));
      return {
        ...inventory.toJSON(),
        images: inventoryImages,
      };
    });

    const response = {
      totalCount: result.total,
      totalPages: result.pages,
      data: inventoryWithImages,
    };

    return res.status(200).json({
      success: true,
      message: "Inventory retrieved successfully",
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

exports.getHistoryInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const kategori = req.query.kategori;
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 10;

    const whereClause = {}

    if(kategori) {
      whereClause.jenis = { [Op.like]: `%${kategori}%` };
    }

    const result = await LogInventory.paginate({
      page: page,
      paginate: pageSize,
      include: [
        {
          model: User,
          attributes: ["id", "nama", "email", "no_telp"],
        },
        {
          model: Inventory,
          where: whereClause,
          include: [
            {
              model: Kandang,
              where: { id: id },
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    if (result.docs.length === 0) {
      return res.status(200).json({
        success: false,
        message: "Inventory history not found",
        result: [],
      });
    }

    const response = {
      totalCount: result.total,
      totalPages: result.pages,
      data: result.docs.map((history) => {
        return {
          id: history.id,
          namaItem: history.Inventory.name,
          keterangan: history.keterangan,
          createdBy: history.User.nama,
          createdAt: history.createdAt,
        };
      }),
    };

    return res.status(200).json({
      success: true,
      message: "Inventory history retrieved successfully",
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

exports.getDetailInventory = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await Inventory.findOne({ where: { id } });

    if (!result) {
      return res.status(200).json({
        success: false,
        message: "Inventory not found",
      });
    }

    const images = await InventoryImage.findAll({
      where: { id_inventory: id },
    });

    const response = {
      // ...result.toJSON(),
      id: result.id,
      idKandang: result.id_kandang,
      name: result.name,
      stock: result.stock,
      jenis: result.jenis,
      isDeleted: result.isDeleted,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
      images: images
        ? images.map((image) => ({ id: image.id, url: image.url }))
        : [],
    };

    return res.status(200).json({
      success: true,
      message: "Inventory retrieved successfully",
      data: response,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: id,
    });
  }
};

exports.updateInventory = async (req, res) => {
  const { id } = req.params;
  const { name, stock, jenis, id_kandang, deletedImagesId = "" } = req.body;

  try {
    const deletedImagesArray = deletedImagesId
      ? deletedImagesId.split(",")
      : [];

    const userId = await getIdUser(req);

    const existingInventory = await Inventory.findOne({ where: { id } });
    if (!existingInventory) {
      return res.status(404).json({
        success: false,
        message: "Inventory not found",
      });
    }

    const userData = await User.findOne({ where: { id: userId } });

    if (!userData) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (name && name !== existingInventory.name) {
      await LogInventory.create({
        id_inventory: existingInventory.id,
        keterangan: `${userData.nama} (as ${userData.role}) changed name from ${existingInventory.name} to ${name}`,
        createdBy: userId,
      });
      existingInventory.name = name;
    }

    if (stock && stock !== existingInventory.stock) {
      await LogInventory.create({
        id_inventory: existingInventory.id,
        keterangan: `${userData.nama} (as ${userData.role}) changed stock from ${existingInventory.stock} to ${stock}`,
        createdBy: userId,
      });
      existingInventory.stock = stock;
    }

    if (jenis && jenis !== existingInventory.jenis) {
      await LogInventory.create({
        id_inventory: existingInventory.id,
        keterangan: `${userData.nama} (as ${userData.role}) changed jenis from ${existingInventory.jenis} to ${jenis}`,
        createdBy: userId,
      });
      existingInventory.jenis = jenis;
    }

    if (id_kandang) existingInventory.id_kandang = id_kandang;

    if (deletedImagesArray.length > 0) {
      const InventoryImages = await InventoryImage.findAll({
        where: { id_Inventory: id },
      });

      if (!InventoryImages) {
        return res.status(404).json({
          success: false,
          message: "Inventory images not found",
        });
      }

      for (let i = 0; i < deletedImagesArray.length; i++) {
        const img = await InventoryImage.findOne({
          where: { id: deletedImagesArray[i] },
        });
        if (img) {
          const fileKey = img.image.split("/").pop();
          await deleteFileFromSpace(fileKey, "Inventory");
          await img.destroy();
        }
      }
    }

    const uploadedImages = [];

    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        const fileName = `Inventory-${Date.now()}-${file.originalname.trim()}`;

        const uploadResult = await uploadFileToSpace(
          file.buffer,
          fileName,
          "Inventory"
        );
        uploadedImages.push(uploadResult);
      }

      for (let i = 0; i < uploadedImages.length; i++) {
        await InventoryImage.create({
          url: uploadedImages[i],
          id_inventory: id,
        });
      }

      InventoryHistory.create({
        InventoryId: existingInventory.id,
        description: `${userData.nama} changed image`,
        createdBy: userId,
      });
    }

    await existingInventory.save();

    return res.status(200).json({
      success: true,
      message: "Inventory updated successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.deleteInventory = async (req, res) => {
  const { id } = req.params;
  try {
    const userId = await getIdUser(req);

    const userData = await User.findOne({ where: { id: userId } });

    const existingInventory = await Inventory.findOne({ where: { id } });

    if (!existingInventory) {
      return res.status(404).json({
        success: false,
        message: "Inventory not found",
      });
    }

    existingInventory.update({ isDeleted: true });
    await existingInventory.save();

    await LogInventory.create({
      id_inventory: existingInventory.id,
      keterangan: `${userData.nama} (as ${userData.role}) deleted ${existingInventory.name}`,
      createdBy: userId,
    });

    return res.status(200).json({
      success: true,
      message: "Inventory deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
