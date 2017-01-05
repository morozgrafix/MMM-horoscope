/* MMM-horoscope
 * Node Helper
 *
 * By morozgrafix https://github.com/morozgrafix/MMM-horoscope
 *
 * License: MIT
 *
 * Based on https://github.com/fewieden/MMM-soccer/blob/master/node_helper.js
 *
 */

const request = require("request");
const NodeHelper = require("node_helper");

module.exports = NodeHelper.create({
	// subclass start method
	start: function(){
		console.log("Starting NodeHelper for " + this.name + "module.");
	},

	// subclass socketNotificationReceived method
	socketNotificationReceived: function(notification, payload) {
		if (notification === "GET_HOROSCOPE_DATA") {
			var query = "{\"sign\":\"" + payload.sign.substring(0,3) + "\",\"frequency\":\"daily\",\"date\":\"" + payload.date + "\",\"week\":\"\",\"month\":\"\"}";
			var options = {
				url: "https://www.yahoo.com/_td/api/resource/horoscope.astro;query=" + encodeURIComponent(query) + ";site=horoscope"
			};
			this.getData(options);
		}
	},

	// get data from URL and broadcast it to MagicMirror module if everyting is OK
	getData: function(options) {
		request(options, (error, response, body) => {
			if (response.statusCode === 200) {
				this.sendSocketNotification("HOROSCOPE_DATA", JSON.parse(body));
			} else {
				this.sendSocketNotification("HOROSCOPE_DATA");
				console.log("Error getting Horoscope data. Response:" + JSON.stringify(response));
			}
		});
	}
});
