require('dotenv').config();
const mongoose = require('mongoose');
const Registration = require('./models/Registration');
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const reg = await Registration.findOne({ finalGrade: { $ne: null } });
  if (reg) {
    console.log("Before:", reg.finalGrade);
    reg.finalGrade = null;
    await reg.save();
    console.log("After saving null:", reg.finalGrade);
    
    // now read it back
    const readBack = await Registration.findById(reg._id);
    console.log("Read back from DB:", readBack.finalGrade);
  } else {
    console.log("No registration with finalGrade found");
  }
  process.exit(0);
});
