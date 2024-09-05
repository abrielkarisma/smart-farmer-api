const { Model } = require("sequelize");
const { paginate } = require("sequelize-paginate");

module.exports = (sequelize, DataTypes) => {
  class LaporanPanenTelur extends Model {
    static associate(models) {
      // Define associations here
      LaporanPanenTelur.belongsTo(models.Kandang, {
        foreignKey: "id_kandang",
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
          model: "Kandang", // Make sure this matches the actual table name
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
          model: "User", // Make sure this matches the actual table name
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
      modelName: "LaporanPanenTelur",
      tableName: "laporan_panen_telur",
    }
  );

  paginate(LaporanPanenTelur);

  return LaporanPanenTelur;
};
