const { Model } = require("sequelize");
const { paginate } = require("sequelize-paginate");

module.exports = (sequelize, DataTypes) => {
  class LaporanPanenTelur extends Model {
    static associate(models) {
      // Define associations here
      LaporanPanenTelur.belongsTo(models.Kandang, {
        foreignKey: "id_kandang",
      });

      LaporanPanenTelur.belongsTo(models.Petugas, {
        foreignKey: "id_petugas",
      });

      LaporanPanenTelur.belongsTo(models.User, {
        foreignKey: "createdBy",
      });
    }
  }

  LaporanPanenTelur.init(
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
      jumlah_telur: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      tanggal: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("pending", "approved", "rejected"),
        allowNull: false,
        defaultValue: "pending",
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
      modelName: "laporanPanenTelur",
      tableName: "laporan_panen_telur",
    }
  );

  paginate(LaporanPanenTelur);

  return LaporanPanenTelur;
};
