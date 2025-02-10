const sequelize = require('../db');
const { DataTypes } = require('sequelize');

/* Пользователи системы (сотрудники) */
const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: '' // или любое другое значение по умолчанию
  },
  lastName: { type: DataTypes.STRING, allowNull: false },
  phone: { type: DataTypes.STRING, allowNull: false },
  birthDate: { type: DataTypes.DATE, allowNull: true },
  description: { type: DataTypes.STRING },
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
  photo: { type: DataTypes.STRING, allowNull: true },
}, { timestamps: true });

/* Поставщики медицинского оборудования */
const Supplier = sequelize.define('Supplier', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  companyName: { type: DataTypes.STRING, allowNull: false },       // ранее "name"
  contactPerson: { type: DataTypes.STRING, allowNull: false },       // ранее "contact_person_name"
  registrationNumber: { type: DataTypes.STRING, allowNull: false },  // можно использовать строку, если в номере могут быть буквы
  phone: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.STRING },
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
  address: { type: DataTypes.STRING, allowNull: false },
  logo: { type: DataTypes.STRING, allowNull: true },                 // ранее "photo"
}, { timestamps: true });

/* Медицинское оборудование */
const Equipment = sequelize.define('Equipment', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  model: { type: DataTypes.STRING, allowNull: false },   // дополнительное поле для модели оборудования
  description: { type: DataTypes.STRING, allowNull: false },
  price: { type: DataTypes.INTEGER, allowNull: false },  // цена или стоимость закупки
  photo: { type: DataTypes.STRING, allowNull: true },
  serialNumber: { type: DataTypes.STRING, allowNull: false }, // уникальный серийный номер
  // supplierId будет добавлено через связь Equipment.belongsTo(Supplier)
}, { timestamps: true });

/* Корзина для формирования закупочного запроса */
const Cart = sequelize.define('Cart', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
}, { timestamps: true });

/* Элементы корзины */
const CartItem = sequelize.define('CartItem', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  cartId: { type: DataTypes.INTEGER, allowNull: false },
  equipmentId: { type: DataTypes.INTEGER, allowNull: false },
  quantity: { type: DataTypes.INTEGER, allowNull: false },
}, { timestamps: true });

/* Заказ (закупка оборудования) */
const Order = sequelize.define('Order', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  deliveryAddress: { type: DataTypes.STRING, allowNull: false }, // адрес доставки или расположения в учреждении
  totalCost: { type: DataTypes.INTEGER, allowNull: false },
  status: { type: DataTypes.STRING, allowNull: false },
  completionTime: { type: DataTypes.STRING, allowNull: true },     // можно заменить на deliveryDate или receivedDate
  orderName: { type: DataTypes.STRING, allowNull: false },         // название заказа
  description: { type: DataTypes.STRING, allowNull: true },
  dateOfOrdering: { type: DataTypes.DATE, allowNull: false },
  // supplierId будет добавлено через связь Order.belongsTo(Supplier)
}, { timestamps: true });

/* Элементы заказа */
const OrderItem = sequelize.define('OrderItem', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  quantity: { type: DataTypes.INTEGER, allowNull: false },
}, { timestamps: true });

/* Отзывы о поставщиках после выполнения заказа */
const SupplierReview = sequelize.define('SupplierReview', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  rating: { type: DataTypes.INTEGER, allowNull: false },
  shortReview: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.STRING, allowNull: false },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  orderId: { type: DataTypes.INTEGER, allowNull: false },
  supplierId: { type: DataTypes.INTEGER, allowNull: false },
}, { timestamps: true });

/* Связи между моделями */

// Пользователь и корзина
User.hasOne(Cart, { foreignKey: 'userId' });
Cart.belongsTo(User, { foreignKey: 'userId' });

// Пользователь и заказы
User.hasMany(Order, { foreignKey: 'userId' });
Order.belongsTo(User, { foreignKey: 'userId' });

// Поставщик и заказы
Supplier.hasMany(Order, { foreignKey: 'supplierId' });
Order.belongsTo(Supplier, { foreignKey: 'supplierId' });

// Поставщик и оборудование
Supplier.hasMany(Equipment, { foreignKey: 'supplierId' });
Equipment.belongsTo(Supplier, { foreignKey: 'supplierId' });

// Поставщик и отзывы
Supplier.hasMany(SupplierReview, { foreignKey: 'supplierId' });
SupplierReview.belongsTo(Supplier, { foreignKey: 'supplierId' });

// Заказ и отзыв (отзыв привязывается к конкретному заказу)
Order.hasOne(SupplierReview, { foreignKey: 'orderId' });
SupplierReview.belongsTo(Order, { foreignKey: 'orderId' });

// Корзина и оборудование через элементы корзины
Cart.belongsToMany(Equipment, { through: CartItem, foreignKey: 'cartId', otherKey: 'equipmentId' });
Equipment.belongsToMany(Cart, { through: CartItem, foreignKey: 'equipmentId', otherKey: 'cartId' });

// Заказ и оборудование через элементы заказа
Order.belongsToMany(Equipment, { through: OrderItem, foreignKey: 'orderId', otherKey: 'equipmentId' });
Equipment.belongsToMany(Order, { through: OrderItem, foreignKey: 'equipmentId', otherKey: 'orderId' });

// Прямые связи для OrderItem
Order.hasMany(OrderItem, { foreignKey: 'orderId' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });

Equipment.hasMany(OrderItem, { foreignKey: 'equipmentId' });
OrderItem.belongsTo(Equipment, { foreignKey: 'equipmentId' });

// Прямые связи для CartItem
Cart.hasMany(CartItem, { foreignKey: 'cartId' });
CartItem.belongsTo(Cart, { foreignKey: 'cartId' });

Equipment.hasMany(CartItem, { foreignKey: 'equipmentId' });
CartItem.belongsTo(Equipment, { foreignKey: 'equipmentId' });

// Пользователь и отзывы о поставщиках
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