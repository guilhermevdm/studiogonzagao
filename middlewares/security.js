
var crypto = require('crypto');

module.exports = {
	encrypt: function encrypt(text) {
				var cipher = crypto.createCipher('aes-256-ctr', 'd6F3Efeq')
				var crypted = cipher.update(text,'utf8','hex')
				crypted += cipher.final('hex');
				return crypted;
			}
}