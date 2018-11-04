const express = require('express');
const { connection } = require('./sequelize');
const cors = require('cors');
const port = 8000;

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}))
app.use('/api', require('./routes/api/users'))
app.use('/api', require('./routes/api/articles'))
app.use('/api', require('./routes/api/profiles'))

connection.sync()
  .then(() => {
    console.log(`Database synced`)
    app.listen(port, () => {
      console.log("Running on port " + port);
    })
  })
  .catch(console.error)

module.exports = app






