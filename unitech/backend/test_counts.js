require('dotenv').config();
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const regs = await mongoose.connection.db.collection('registrations').aggregate([{ $group: { _id: '$class', count: { $sum: 1 } } }]).toArray();
  const classes = await mongoose.connection.db.collection('classes').find().toArray();
  const res = classes.map(c => ({
    code: c.classCode,
    max: c.capacityMax,
    enrolled: (regs.find(r => r._id.toString() === c._id.toString()) || {}).count || 0
  }));
  console.log(res.slice(0, 20));
  process.exit(0);
});
