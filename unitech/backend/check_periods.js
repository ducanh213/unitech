require('dotenv').config();
const mongoose = require('mongoose');
const Period = require('./models/Period');
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const periods = await Period.find({}).sort({ endDate: 1 });
  periods.forEach(p => console.log(`${p.semester} | status: ${p.status} | endDate: ${p.endDate}`));
  process.exit(0);
});
