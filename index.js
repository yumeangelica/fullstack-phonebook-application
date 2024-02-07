require('express-async-errors');
const mongoose = require('mongoose');
const app = require('./server/app');
const cors = require('cors');
const { MONGODB_URI, PORT, ALLOWED_ORIGINS } = require('./server/utils/config');

app.use(cors({
  origin: ALLOWED_ORIGINS,
}));

const connectToMongoDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('connected to MongoDB');
  } catch (error) {
    console.log('error connecting to MongoDB:', error.message);
  }
};

connectToMongoDB();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
