import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

interface UserAttributes {
  id?: number; // Optional for creation
  name: string;
  email: string;
  phone?: string;
  dob?: string;
  password: string;
  transactions: any[];
}

class User extends Model<UserAttributes> implements UserAttributes {
  public id!: number; // Non-null in instance
  public name!: string;
  public email!: string;
  public phone?: string;
  public dob?: string;
  public password!: string;
  public transactions!: any[];
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    dob: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    transactions: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
  },
  {
    sequelize,
    modelName: "User",
  }
);

export default User;
