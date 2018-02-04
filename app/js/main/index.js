try {
  process.env.PRODUCTION = false;
  require('babel-register');
} catch (err) {
  process.env.PRODUCTION = true;
}

require('./main.js');