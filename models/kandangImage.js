const { Model } = require("sequelize");
const { paginate } = require("sequelize-paginate");

module.exports = (sequelize, DataTypes) => {
  class KandangImage extends Model {
    static associate(models) {
      // Define association here
      KandangImage.belongsTo(models.Kandang, {
        foreignKey: "id_kandang",
        as: "kandangImages",
      });
    }
  }

  KandangImage.init(
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
      modelName: "KandangImage",
      tableName: "kandang_images",
    }
  );

  paginate(KandangImage);

  return KandangImage;
};
