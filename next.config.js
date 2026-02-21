module.exports = {
reactStrictMode: true,
webpack: function(config) {
config.resolve.fallback = { fs: false, path: false, crypto: false };
return config;
}
};
