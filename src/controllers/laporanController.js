const {
  LaporanPanenTelur,
  LaporanKematianAyam,
  LaporanPanenAyamPedagingSampling,
  LaporanPanenAyamPedagingSamplingImage,
  User,
  Petugas,
  Kandang,
} = require("../../models/");
const { Op, where, Sequelize, fn, literal, col } = require("sequelize");
const moment = require("moment-timezone");
const { addDays, format } = require("date-fns");
const { getIdUser } = require("../utils/helper");
const { config } = require("dotenv");
const { id } = require("date-fns/locale");
const kandang = require("../../models/kandang");

config();

exports.getAllLaporanByUser = async (req, res) => {
  try {
    const userId = await getIdUser(req);
    const page = req.query.page || 1;
    const pageSize = req.query.pageSize || 10;
    const searchTerm = req.query.searchTerm;

    const laporanPanenTelur = await LaporanPanenTelur.findAll({
      where: { createdBy: userId },
      include: [
        {
          model: User,
          attributes: ["id", "nama", "email", "no_telp"],
        },
        {
          model: Kandang,
          attributes: ["id", "nama", "lokasi", "latitude", "longitude"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    const laporanKematianAyam = await LaporanKematianAyam.findAll({
      where: { createdBy: userId },
      include: [
        {
          model: User,
          attributes: ["id", "nama", "email", "no_telp"],
        },
        {
          model: Kandang,
          attributes: ["id", "nama", "lokasi", "latitude", "longitude"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    const laporanPanenAyamPedagingSampling =
      await LaporanPanenAyamPedagingSampling.findAll({
        where: { createdBy: userId },
        include: [
          {
            model: User,
            attributes: ["id", "nama", "email", "no_telp"],
          },
          {
            model: Kandang,
            attributes: ["id", "nama", "lokasi", "latitude", "longitude"],
          },
        ],
        order: [["createdAt", "DESC"]],
      });

    const laporan = [
      ...laporanPanenTelur.map((laporan) => ({
        id_laporan: laporan.id,
        jenis: "Hasil Panen Telur",
        kandang: laporan.Kandang.nama,
        tanggal: laporan.tanggal,
      })),
      ...laporanKematianAyam.map((laporan) => ({
        id_laporan: laporan.id,
        jenis: "Kematian Ayam",
        kandang: laporan.Kandang.nama,
        tanggal: laporan.tanggal,
      })),
      ...laporanPanenAyamPedagingSampling.map((laporan) => ({
        id_laporan: laporan.id,
        jenis: "Hasil Panen Ayam Pedaging",
        kandang: laporan.Kandang.nama,
        tanggal: laporan.tanggal,
      })),
    ];

    return res.status(200).json({
      success: true,
      message: "Get all laporan success",
      data: laporan,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.getAllLaporanByOwner = async (req, res) => {
  try {
    const userId = await getIdUser(req);

    const searchTermJenis = req.query.jenis
      ? req.query.jenis.toLowerCase()
      : "";
    const searchTermKandang = req.query.kandang
      ? req.query.kandang.toLowerCase()
      : "";
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 10;

    let orders = [["createdAt", "DESC"]];
    const whereClause = {
      id_pemilik: userId,
      nama: { [Op.like]: `%${searchTermKandang}%` },
    };

    // Initialize laporan arrays
    let laporanPanenTelur = { docs: [], total: 0 };
    let laporanKematianAyam = { docs: [], total: 0 };
    let laporanPanenAyamPedagingSampling = { docs: [], total: 0 };

    // Use Op.like to filter by jenis and kandang
    if (!searchTermJenis || searchTermJenis.includes("telur")) {
      laporanPanenTelur = await LaporanPanenTelur.paginate({
        include: [
          {
            model: User,
            attributes: ["id", "nama", "email", "no_telp"],
          },
          {
            model: Kandang,
            attributes: ["id", "nama", "lokasi", "latitude", "longitude"],
            where: whereClause,
          },
        ],
        page: page,
        paginate: pageSize,
        order: orders,
      });
    }

    if (!searchTermJenis || searchTermJenis.includes("kematian")) {
      laporanKematianAyam = await LaporanKematianAyam.paginate({
        include: [
          {
            model: User,
            attributes: ["id", "nama", "email", "no_telp"],
          },
          {
            model: Kandang,
            attributes: ["id", "nama", "lokasi", "latitude", "longitude"],
            where: whereClause,
          },
        ],
        page: page,
        paginate: pageSize,
        order: orders,
      });
    }

    if (!searchTermJenis || searchTermJenis.includes("pedaging")) {
      laporanPanenAyamPedagingSampling =
        await LaporanPanenAyamPedagingSampling.paginate({
          include: [
            {
              model: User,
              attributes: ["id", "nama", "email", "no_telp"],
            },
            {
              model: Kandang,
              attributes: ["id", "nama", "lokasi", "latitude", "longitude"],
              where: whereClause,
            },
          ],
          page: page,
          paginate: pageSize,
          order: orders,
        });
    }

    const laporan = [
      ...laporanPanenTelur.docs.map((laporan) => ({
        idLaporan: laporan.id,
        jenis: "Hasil Panen Telur",
        kandang: laporan.Kandang.nama,
        tanggal: laporan.tanggal,
        status: laporan.status,
      })),
      ...laporanKematianAyam.docs.map((laporan) => ({
        idLaporan: laporan.id,
        jenis: "Kematian Ayam",
        kandang: laporan.Kandang.nama,
        tanggal: laporan.tanggal,
        status: laporan.status,
      })),
      ...laporanPanenAyamPedagingSampling.docs.map((laporan) => ({
        idLaporan: laporan.id,
        jenis: "Hasil Panen Ayam Pedaging",
        kandang: laporan.Kandang.nama,
        tanggal: laporan.tanggal,
        status: laporan.status,
      })),
    ];

    const totalCount =
      laporanPanenTelur.total +
      laporanKematianAyam.total +
      laporanPanenAyamPedagingSampling.total;
    const totalPages = Math.ceil(totalCount / pageSize);

    const response = {
      totalCount: laporan.length,
      totalPages: totalPages,
      data: laporan,
    };

    if (laporan.length === 0) {
      return res.status(200).json({
        success: false,
        message: "Laporan not added yet",
        result: response,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Laporan retrieved successfully",
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

exports.getAllLaporanByPetugas = async (req, res) => {
  try {
    const userId = await getIdUser(req);

    const searchTermJenis = req.query.jenis
      ? req.query.jenis.toLowerCase()
      : "";
    const searchTermKandang = req.query.kandang
      ? req.query.kandang.toLowerCase()
      : "";
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 10;

    const petugas = await Petugas.findOne({ where: { user_id: userId } });

    let orders = [["createdAt", "DESC"]];
    const whereClause = {
      id: petugas.id_kandang,
      nama: { [Op.like]: `%${searchTermKandang}%` },
    };

    // Initialize laporan arrays
    let laporanPanenTelur = { docs: [], total: 0 };
    let laporanKematianAyam = { docs: [], total: 0 };
    let laporanPanenAyamPedagingSampling = { docs: [], total: 0 };

    // Use Op.like to filter by jenis and kandang
    if (!searchTermJenis || searchTermJenis.includes("telur")) {
      laporanPanenTelur = await LaporanPanenTelur.paginate({
        include: [
          {
            model: User,
            attributes: ["id", "nama", "email", "no_telp"],
          },
          {
            model: Kandang,
            attributes: ["id", "nama", "lokasi", "latitude", "longitude"],
            where: whereClause,
          },
        ],
        page: page,
        paginate: pageSize,
        order: orders,
      });
    }

    if (!searchTermJenis || searchTermJenis.includes("kematian")) {
      laporanKematianAyam = await LaporanKematianAyam.paginate({
        include: [
          {
            model: User,
            attributes: ["id", "nama", "email", "no_telp"],
          },
          {
            model: Kandang,
            attributes: ["id", "nama", "lokasi", "latitude", "longitude"],
            where: whereClause,
          },
        ],
        page: page,
        paginate: pageSize,
        order: orders,
      });
    }

    if (!searchTermJenis || searchTermJenis.includes("pedaging")) {
      laporanPanenAyamPedagingSampling =
        await LaporanPanenAyamPedagingSampling.paginate({
          include: [
            {
              model: User,
              attributes: ["id", "nama", "email", "no_telp"],
            },
            {
              model: Kandang,
              attributes: ["id", "nama", "lokasi", "latitude", "longitude"],
              where: whereClause,
            },
          ],
          page: page,
          paginate: pageSize,
          order: orders,
        });
    }

    const laporan = [
      ...laporanPanenTelur.docs.map((laporan) => ({
        idLaporan: laporan.id,
        jenis: "Hasil Panen Telur",
        kandang: laporan.Kandang.nama,
        tanggal: laporan.tanggal,
        status: laporan.status,
      })),
      ...laporanKematianAyam.docs.map((laporan) => ({
        idLaporan: laporan.id,
        jenis: "Kematian Ayam",
        kandang: laporan.Kandang.nama,
        tanggal: laporan.tanggal,
        status: laporan.status,
      })),
      ...laporanPanenAyamPedagingSampling.docs.map((laporan) => ({
        idLaporan: laporan.id,
        jenis: "Hasil Panen Ayam Pedaging",
        kandang: laporan.Kandang.nama,
        tanggal: laporan.tanggal,
        status: laporan.status,
      })),
    ];

    const totalCount =
      laporanPanenTelur.total +
      laporanKematianAyam.total +
      laporanPanenAyamPedagingSampling.total;
    const totalPages = Math.ceil(totalCount / pageSize);

    const response = {
      totalCount: laporan.length,
      totalPages: totalPages,
      data: laporan,
    };

    if (laporan.length === 0) {
      return res.status(200).json({
        success: false,
        message: "Laporan not added yet",
        result: response,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Laporan retrieved successfully",
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

exports.getDetailLaporan = async (req, res) => {
  try {
    const userId = await getIdUser(req);
    const id = req.params.id;

    const laporanPanenTelur = await LaporanPanenTelur.findOne({
      where: { id },
      include: [
        {
          model: User,
        },
        {
          model: Kandang,
        },
      ],
    });

    const laporanKematianAyam = await LaporanKematianAyam.findOne({
      where: { id },
      include: [
        {
          model: User,
        },
        {
          model: Kandang,
        },
      ],
    });

    const laporanPanenAyamPedagingSampling =
      await LaporanPanenAyamPedagingSampling.findOne({
        where: { id },
        include: [
          {
            model: User,
          },
          {
            model: Kandang,
          },
          {
            model: LaporanPanenAyamPedagingSamplingImage,
            as: "images",
          },
        ],
      });

    if (laporanPanenTelur) {
      const response = {
        id: laporanPanenTelur.id,
        jenis: "Laporan Panen Telur",
        status: laporanPanenTelur.status,
        namaKandang: laporanPanenTelur.Kandang.nama,
        lokasiKandang: laporanPanenTelur.Kandang.lokasi,
        longitude: laporanPanenTelur.Kandang.longitude,
        latitude: laporanPanenTelur.Kandang.latitude,
        tanggal: laporanPanenTelur.tanggal,
        totalTelur: laporanPanenTelur.jumlah_telur,
        totalAyam: laporanPanenTelur.Kandang.jumlah_ayam,
        namaPelapor: laporanPanenTelur.User.nama,
        createdAt: laporanPanenTelur.createdAt,
        updatedAt: laporanPanenTelur.updated,
      };
      return res.status(200).json({
        success: true,
        message: "Get detail laporan success",
        data: response,
      });
    }

    if (laporanKematianAyam) {
      const response = {
        id: laporanKematianAyam.id,
        jenis: "Laporan Kematian Ayam",
        status: laporanKematianAyam.status,
        namaKandang: laporanKematianAyam.Kandang.nama,
        lokasiKandang: laporanKematianAyam.Kandang.lokasi,
        longitude: laporanKematianAyam.Kandang.longitude,
        latitude: laporanKematianAyam.Kandang.latitude,
        tanggal: laporanKematianAyam.tanggal,
        jumlah: laporanKematianAyam.jumlah,
        totalAyam: laporanKematianAyam.Kandang.jumlah_ayam,
        namaPelapor: laporanKematianAyam.User.nama,
        ciriCiri: laporanKematianAyam.keterangan,
        createdAt: laporanKematianAyam.createdAt,
        updatedAt: laporanKematianAyam.updatedAt,
      };
      return res.status(200).json({
        success: true,
        message: "Get detail laporan success",
        data: response,
      });
    }

    if (laporanPanenAyamPedagingSampling) {
      const response = {
        id: laporanPanenAyamPedagingSampling.id,
        jenis: "Laporan Panen Ayam Pedaging",
        status: laporanPanenAyamPedagingSampling.status,
        namaKandang: laporanPanenAyamPedagingSampling.Kandang.nama,
        lokasiKandang: laporanPanenAyamPedagingSampling.Kandang.lokasi,
        longitude: laporanPanenAyamPedagingSampling.Kandang.longitude,
        latitude: laporanPanenAyamPedagingSampling.Kandang.latitude,
        tanggal: laporanPanenAyamPedagingSampling.tanggal,
        totalBerat: laporanPanenAyamPedagingSampling.total_berat,
        totalAyam: laporanPanenAyamPedagingSampling.Kandang.jumlah_ayam,
        namaPelapor: laporanPanenAyamPedagingSampling.User.nama,
        createdAt: laporanPanenAyamPedagingSampling.createdAt,
        updatedAt: laporanPanenAyamPedagingSampling.updatedAt,
        images: laporanPanenAyamPedagingSampling.images.map((image) => ({
          id: image.id,
          url: image.url,
        })),
      };
      return res.status(200).json({
        success: true,
        message: "Get detail laporan success",
        data: response,
      });
    }

    return res.status(404).json({
      success: false,
      message: "Laporan not found",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
exports.getStatisticByKandang = async (req, res) => {
  try {
    const kandangId = req.params.id;
    const searchDate = req.query.date;
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 10;
    const kategori = req.query.kategori;

    const today = moment().tz("Asia/Jakarta").add(24, "hours").format("YYYY-MM-DD");
    const weekAgo = moment()
      .tz("Asia/Jakarta")
      .subtract(6, "days")
      .format("YYYY-MM-DD");

    const searchDateStart = req.query.dateStart || weekAgo;
    const searchDateEnd = req.query.dateEnd || today;

    let listOrder = [["tanggal", "DESC"]];

    const whereClause = { id_kandang: kandangId, status: "approved" };
    const whereClauseGraph = { id_kandang: kandangId, status: "approved" };

    if (searchDateStart && searchDateEnd) {
      whereClauseGraph.tanggal = {
        [Op.and]: [
          { [Op.gte]: new Date(searchDateStart) },
          { [Op.lte]: new Date(searchDateEnd) },
        ],
      };
    } else if (searchDateStart) {
      whereClauseGraph.tanggal = {
        [Op.gte]: new Date(searchDateStart),
      };
    } else if (searchDateEnd) {
      whereClauseGraph.tanggal = {
        [Op.lte]: new Date(searchDateEnd),
      };
    }

    if (searchDate) {
      whereClause.tanggal = {
        [Op.eq]: new Date(searchDate),
      };
    } else if (searchDateStart && searchDateEnd) {
      whereClause.tanggal = {
        [Op.and]: [
          { [Op.gte]: new Date(searchDateStart) },
          { [Op.lte]: new Date(searchDateEnd) },
        ],
      };
    } else if (searchDateStart) {
      whereClause.tanggal = {
        [Op.gte]: new Date(searchDateStart),
      };
    } else if (searchDateEnd) {
      whereClause.tanggal = {
        [Op.lte]: new Date(searchDateEnd),
      };
    }

    let includeClause = [
      {
        model: User,
        attributes: ["id", "nama", "email", "no_telp"],
      },
      {
        model: Kandang,
        attributes: ["id", "nama", "lokasi", "latitude", "longitude"],
      },
    ];

    let model;
    if (kategori === "panen telur") {
      model = LaporanPanenTelur;
    } else if (kategori === "kematian ayam") {
      model = LaporanKematianAyam;
    } else if (kategori === "ayam pedaging") {
      model = LaporanPanenAyamPedagingSampling;
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid kategori",
      });
    }

    const graph = await model.findAll({
      where: whereClauseGraph,
      order: [["tanggal", "ASC"]],
      include: includeClause,
    });

    const result = await model.paginate({
      page: page,
      paginate: pageSize,
      where: whereClause,
      order: listOrder,
      include: includeClause,
    });

    const orderCountByDay = {};

    for (let i = 0; i < 7; i++) {
      const date = moment(searchDateStart ? new Date(searchDateStart) : weekAgo)
        .add(i, "days")
        .format("YYYY-MM-DD");

      orderCountByDay[date] = {
        fullDate: date,
        dayOfMonth: moment(date).format("DD"),
        count: 0,
      };
    }

    graph.forEach((order) => {
      const fullDate = moment(order.tanggal)
        .format("YYYY-MM-DD");

      console.log(
        "Comparing dates:",
        fullDate,
        "with orderCountByDay:",
        Object.keys(orderCountByDay)
      );

      if (orderCountByDay[fullDate]) {
        orderCountByDay[fullDate].count++;
      }
    });

    const sortedOrderCountByDay = Object.keys(orderCountByDay)
      .sort()
      .map((fullDate) => {
        return {
          date: orderCountByDay[fullDate].dayOfMonth,
          count: orderCountByDay[fullDate].count,
        };
      });

    const response = {
      totalCount: result.total,
      totalPages: result.pages,
      graph: sortedOrderCountByDay,
      data: result.docs.map((item) => {
        return {
          id: item.id,
          jenis: kategori,
          kandang: item.Kandang.nama,
          deskripsi: item.keterangan || "-",
          total: item.jumlah || item.jumlah_telur || item.total_berat,
          tanggal: item.tanggal,
          user: item.User.nama,
        };
      }),
    };

    return res.status(200).json({
      success: true,
      message: "Get laporan statistics successfully",
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
