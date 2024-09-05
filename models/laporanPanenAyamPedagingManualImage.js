const { Model } = require("sequelize");
const { paginate } = require("sequelize-paginate");

module.exports = (sequelize, DataTypes) => {
  class LaporanPanenAyamPedagingManualImage extends Model {
    static associate(models) {
      // Define associations here
      LaporanPanenAyamPedagingManualImage.belongsTo(
        models.LaporanPanenAyamPedagingManual,
        {
          foreignKey: "id_laporan_panen_ayam_pedaging_manual",
        }
      );
    }
  }

  LaporanPanenAyamPedagingManualImage.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      id_laporan_panen_ayam_pedaging_manual: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "laporan_panen_ayam_pedaging_manual", // Make sure this matches the actual table name
          key: "id",
        },
      },
      url: {
        type: DataTypes.STRING,
        allowNull: false,
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
      modelName: "laporanPanenAyamPedagingManualImage",
      tableName: "laporan_panen_ayam_pedaging_manual_images",
    }
  );

  paginate(LaporanPanenAyamPedagingManualImage);

  return LaporanPanenAyamPedagingManualImage;
};
