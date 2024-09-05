const { Model } = require("sequelize");
const { paginate } = require("sequelize-paginate");

module.exports = (sequelize, DataTypes) => {
  class LaporanKematianAyam extends Model {
    static associate(models) {
      // Define associations here
      LaporanKematianAyam.belongsTo(models.Kandang, {
        foreignKey: "id_kandang",
      });

      LaporanKematianAyam.belongsTo(models.User, {
        foreignKey: "createdBy",
      });
    }
  }

  LaporanKematianAyam.init(
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
      jumlah: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      tanggal: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      keterangan: {
        type: DataTypes.STRING,
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
      modelName: "LaporanKematianAyam",
      tableName: "laporan_kematian_ayam",
    }
  );

  paginate(LaporanKematianAyam);

  return LaporanKematianAyam;
};
