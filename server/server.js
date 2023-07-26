const app = require("./app.js");
const PORT = process.env.PORT || 5000;

app.listen(PORT, (req, res) => {
  console.log(`server is running on http://localhost:${PORT}`);
});
