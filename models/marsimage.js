'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class MarsImage extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  MarsImage.init({
    imageId: DataTypes.STRING,
    url: DataTypes.STRING,
    sol: DataTypes.STRING,
    earthDate: DataTypes.STRING,
    email: DataTypes.STRING,
    camera: DataTypes.STRING,
    mission: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'MarsImage',
  });
  return MarsImage;
};