const { Model } = require("sequelize");
const { paginate } = require("sequelize-paginate");

module.exports = (sequelize, DataTypes) => {
  class LaporanPanenAyamPedagingManual extends Model {
    static associate(models) {
      // Define associations here
      LaporanPanenAyamPedagingManual.belongsTo(models.Kandang, {
        foreignKey: "id_kandang",
      });

      LaporanPanenAyamPedagingManual.belongsTo(models.Petugas, {
        foreignKey: "id_petugas",
      });

      LaporanPanenAyamPedagingManual.belongsTo(models.User, {
        foreignKey: "createdBy",
      });
    }
  }

  LaporanPanenAyamPedagingManual.init(
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
      nama: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      tanggal: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      berat_ayam: {
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
      modelName: "laporanPanenAyamPedagingManual",
      tableName: "laporan_panen_ayam_pedaging_manual",
    }
  );

  paginate(LaporanPanenAyamPedagingManual);

  return LaporanPanenAyamPedagingManual;
};
