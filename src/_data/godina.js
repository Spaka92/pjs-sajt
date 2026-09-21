/* A .js file in _data/ runs at BUILD time and its return value
   becomes a global variable in every template. This is how the
   copyright year stays correct without any browser JavaScript —
   it is baked in each time the site rebuilds. */
module.exports = () => new Date().getFullYear();
