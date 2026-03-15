// Settings controller (example: app settings, can be expanded)
let settings = {
  siteName: 'Aditya Construction',
  theme: 'light',
};

exports.get = (req, res) => {
  res.json(settings);
};

exports.update = (req, res) => {
  settings = { ...settings, ...req.body };
  res.json(settings);
};