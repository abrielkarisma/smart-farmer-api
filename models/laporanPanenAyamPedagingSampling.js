const { Model } = require("sequelize");
const { paginate } = require("sequelize-paginate");

module.exports = (sequelize, DataTypes) => {
  class LaporanPanenAyamPedagingSampling extends Model {
    static associate(models) {
      // Define associations here
      LaporanPanenAyamPedagingSampling.belongsTo(models.Kandang, {
        foreignKey: "id_kandang",
      });

      LaporanPanenAyamPedagingSampling.belongsTo(models.Petugas, {
        foreignKey: "id_petugas",
      });

      LaporanPanenAyamPedagingSampling.belongsTo(models.User, {
        foreignKey: "createdBy",
      });
    }
  }

  LaporanPanenAyamPedagingSampling.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      id_kandang: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "kandang", // Make sure this matches the actual table name
          key: "id",
        },
      },
      id_petugas: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "petugas", // Make sure this matches the actual table name
          key: "id",
        },
      },
      tanggal: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      total_berat: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      createdBy: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "user", // Make sure this matches the actual table name
          key: "id",
        },
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
    },
    {
      sequelize,
      modelName: "laporanPanenAyamPedagingSampling",
      tableName: "laporan_panen_ayam_pedaging_sampling",
    }
  );

  paginate(LaporanPanenAyamPedagingSampling);

  return LaporanPanenAyamPedagingSampling;
};
