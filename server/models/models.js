const sequelize = require('../db');
const { DataTypes } = require('sequelize');


const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: '' 
  },
  lastName: { type: DataTypes.STRING, allowNull: false },
  phone: { type: DataTypes.STRING, allowNull: false },
  birthDate: { type: DataTypes.DATE, allowNull: true },
  description: { type: DataTypes.STRING },
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
  photo: { type: DataTypes.STRING, allowNull: true },
}, { timestamps: true });


const Supplier = sequelize.define('Supplier', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  companyName: { type: DataTypes.STRING, allowNull: false },       
  contactPerson: { type: DataTypes.STRING, allowNull: false },       
  registrationNumber: { type: DataTypes.STRING, allowNull: false },  
  phone: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.STRING },
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
  address: { type: DataTypes.STRING, allowNull: false },
  logo: { type: DataTypes.STRING, allowNull: true },                 
}, { timestamps: true });


const Equipment = sequelize.define('Equipment', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  model: { type: DataTypes.STRING, allowNull: false },   
  description: { type: DataTypes.STRING, allowNull: false },
  price: { type: DataTypes.INTEGER, allowNull: false },  
  photo: { type: DataTypes.STRING, allowNull: true },
  serialNumber: { type: DataTypes.STRING, allowNull: false }, 
  
}, { timestamps: true });


const Cart = sequelize.define('Cart', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
}, { timestamps: true });


const CartItem = sequelize.define('CartItem', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  cartId: { type: DataTypes.INTEGER, allowNull: false },
  equipmentId: { type: DataTypes.INTEGER, allowNull: false },
  quantity: { type: DataTypes.INTEGER, allowNull: false },
}, { timestamps: true });


const Order = sequelize.define('Order', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  deliveryAddress: { type: DataTypes.STRING, allowNull: false }, 
  totalCost: { type: DataTypes.INTEGER, allowNull: false },
  status: { type: DataTypes.STRING, allowNull: false },
  completionTime: { type: DataTypes.STRING, allowNull: true },     
  orderName: { type: DataTypes.STRING, allowNull: false },         
  description: { type: DataTypes.STRING, allowNull: true },
  dateOfOrdering: { type: DataTypes.DATE, allowNull: false },
  
}, { timestamps: true });


const OrderItem = sequelize.define('OrderItem', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  quantity: { type: DataTypes.INTEGER, allowNull: false },
}, { timestamps: true });


const SupplierReview = sequelize.define('SupplierReview', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  rating: { type: DataTypes.INTEGER, allowNull: false },
  shortReview: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.STRING, allowNull: false },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  orderId: { type: DataTypes.INTEGER, allowNull: false },
  supplierId: { type: DataTypes.INTEGER, allowNull: false },
}, { timestamps: true });




User.hasOne(Cart, { foreignKey: 'userId' });
Cart.belongsTo(User, { foreignKey: 'userId' });


User.hasMany(Order, { foreignKey: 'userId' });
Order.belongsTo(User, { foreignKey: 'userId' });


Supplier.hasMany(Order, { foreignKey: 'supplierId' });
Order.belongsTo(Supplier, { foreignKey: 'supplierId' });


Supplier.hasMany(Equipment, { foreignKey: 'supplierId' });
Equipment.belongsTo(Supplier, { foreignKey: 'supplierId' });


Supplier.hasMany(SupplierReview, { foreignKey: 'supplierId' });
SupplierReview.belongsTo(Supplier, { foreignKey: 'supplierId' });


Order.hasOne(SupplierReview, { foreignKey: 'orderId' });
SupplierReview.belongsTo(Order, { foreignKey: 'orderId' });


Cart.belongsToMany(Equipment, { through: CartItem, foreignKey: 'cartId', otherKey: 'equipmentId' });
Equipment.belongsToMany(Cart, { through: CartItem, foreignKey: 'equipmentId', otherKey: 'cartId' });


Order.belongsToMany(Equipment, { through: OrderItem, foreignKey: 'orderId', otherKey: 'equipmentId' });
Equipment.belongsToMany(Order, { through: OrderItem, foreignKey: 'equipmentId', otherKey: 'orderId' });


Order.hasMany(OrderItem, { foreignKey: 'orderId' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });

Equipment.hasMany(OrderItem, { foreignKey: 'equipmentId' });
OrderItem.belongsTo(Equipment, { foreignKey: 'equipmentId' });


Cart.hasMany(CartItem, { foreignKey: 'cartId' });
CartItem.belongsTo(Cart, { foreignKey: 'cartId' });

Equipment.hasMany(CartItem, { foreignKey: 'equipmentId' });
CartItem.belongsTo(Equipment, { foreignKey: 'equipmentId' });


User.hasMany(SupplierReview, { foreignKey: 'userId' });
SupplierReview.belongsTo(User, { foreignKey: 'userId' });

module.exports = {
  User,
  Supplier,
  Equipment,
  Cart,
  CartItem,
  Order,
  OrderItem,
  SupplierReview,
  sequelize,
};