const register = (req, res, next) => {
  res.status(200).json({ message: "reaching register route" });
}
const login = (req, res, next) => {
  res.status(200).json({ message: "reaching login route" });
}
const favourites = (req, res, next) => {
  res.status(200).json({ message: "reaching favourite-books route" });
}
module.exports = {
  register,
  login,
  favourites
}