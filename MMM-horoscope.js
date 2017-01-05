Module.register("MMM-horoscope",{
	defaults: {
		sign: "aries",
		maxWidth: "400px", // maximum width of the module in px, %, em
		timeShift: 5 * 60 * 60 * 1000, // shift clock in milliseconds to start showing next day horoscope at 7pm (24 - 19 = 5)
		updateInterval: 1 * 60 * 60 * 1000, // updates every hour
		initialLoadDelay: 0,
		useTextIcon: true,
		animationSpeed: 2000,
		zodiacTable: {
			"aries": {
				"signId": "ari",
				"range": "3/21-4/19",
				"unicodeChar": "&#9800;"
			},
			"taurus": {
				"signId": "tau",
				"range": "4/20-5/20",
				"unicodeChar": "&#9801;"
			},
			"gemini": {
				"signId": "gem",
				"range": "5/21-6/21",
				"unicodeChar": "&#9802;"
			},
			"cancer": {
				"signId": "can",
				"range": "6/22-7/22",
				"unicodeChar": "&#9803;"
			},
			"leo": {
				"signId": "leo",
				"range": "7/23-8/22",
				"unicodeChar": "&#9804;"
			},
			"virgo": {
				"signId": "vir",
				"range": "8/23-9/22",
				"unicodeChar": "&#9805;"
			},
			"libra": {
				"signId": "lib",
				"range": "9/23-10/22",
				"unicodeChar": "&#9806;"
			},
			"scorpio": {
				"signId": "sco",
				"range": "10/23-11/21",
				"unicodeChar": "&#9807;"
			},
			"sagittarius": {
				"signId": "sag",
				"range": "11/22-12/21",
				"unicodeChar": "&#9808;"
			},
			"capricorn": {
				"signId": "cap",
				"range": "12/22-1/19",
				"unicodeChar": "&#9809;"
			},
			"aquarius": {
				"signId": "aqu",
				"range": "1/20-2/18",
				"unicodeChar": "&#9810;"
			},
			"pisces": {
				"signId": "pis",
				"range": "2/19-3/20",
				"unicodeChar": "&#9811;"
			}
		},
		debug: false
	},

	getStyles: function() {
		return ["MMM-horoscope.css"];
	},

	getScripts: function() {
		return [
			"moment.js"
		];
	},

	start: function() {
		Log.info("Starting module: " + this.name);
		if (this.config.debug) {
			this.config.updateInterval = 60 * 1000; // update very 1 minute for debug
		}
		// just in case someone puts mixed case in their config files
		this.config.sign = this.config.sign.toLowerCase();
		this.sign = null;
		this.signText = null;
		this.horoscopeText = null;
		this.horoscpeDate = null;
		this.scheduleUpdate(this.config.initialLoadDelay);
	},

	updateHoroscope: function() {
		this.date = new Date();
		this.sendSocketNotification("GET_HOROSCOPE_DATA", { sign: this.config.sign, date: moment(this.date).add(this.config.timeShift, "milliseconds").format("YYYYMMDD") });
	},


	// Subclass socketNotificationReceived method.
	socketNotificationReceived: function(notification, payload){
		if(notification === "HOROSCOPE_DATA" && payload != null){
			this.horoscopeData = payload[0];
			this.processHoroscope(this.horoscopeData);
		} else {
			this.processHoroscopeError("Unable to get horoscope from API. Please check the logs.");
		}
	},

	processHoroscope: function(data) {
		const regex = /<a.*\/a>/g;
		const subst = "";
		this.sign = this.config.zodiacTable[this.config.sign]["unicodeChar"];
		this.signText = data.sign;
		this.horoscopeText = data.overview.replace(regex, subst).trim();
		this.horoscopeDate = data.frequencyValue
		this.loaded = true;
		this.updateDom(this.config.animationSpeed);
		this.scheduleUpdate();

	},

	processHoroscopeError: function(error) {
		this.loaded = true;
		this.error = true;
		this.updateDom(this.config.animationSpeed);
		Log.error("Process Horoscope Error: ", error);
	},


	getDom: function() {
		var wrapper = document.createElement("div");
		wrapper.className = "horoscope-wrapper"
		wrapper.style["max-width"] = this.config.maxWidth;

		if (this.config.sign === "") {
			wrapper.innerHTML = "Please set the correct Zodiac <i>sign</i> in the config for module: " + this.name + ".";
			wrapper.className = "dimmed light small";
			return wrapper;
		}

		if (!this.loaded) {
			wrapper.innerHTML = "Aligning Stars...";
			wrapper.className = "dimmed light small";
			return wrapper;
		}

		if (this.error) {
			wrapper.innerHTML = this.name + ": Something went wrong. Please check logs.";
			wrapper.className = "bright light small";
			return wrapper;
		}

		var horoscopeTop = document.createElement("div");
		horoscopeTop.className = "horoscope-top";

		var zodiacIcon = document.createElement("div");
		if (this.config.useTextIcon) {
			zodiacIcon.className = "zodiac-text-icon";
			zodiacIcon.innerHTML = this.sign;
		} else {
			zodiacIcon.className = "zodiac-icon " + this.config.sign;
		}

		var horoscopeTitle = document.createElement("div");
		horoscopeTitle.className = "horoscope-title align-right";

		var zodiacSignText = document.createElement("div");
		zodiacSignText.className = "zodiac-sign-text medium";
		zodiacSignText.innerHTML = this.signText;

		var horoscopeDate = document.createElement("div");
		horoscopeDate.className = "horoscope-date xsmall";
		horoscopeDate.innerHTML = "Horoscope for " + moment(this.horoscopeDate).format("LL");

		horoscopeTitle.appendChild(zodiacSignText);
		horoscopeTitle.appendChild(horoscopeDate);

		horoscopeTop.appendChild(zodiacIcon);
		horoscopeTop.appendChild(horoscopeTitle);

		wrapper.appendChild(horoscopeTop);

		var horoscopeText = document.createElement("div");
		horoscopeText.className = "horoscope-text small";
		horoscopeText.innerHTML = this.horoscopeText;
		wrapper.appendChild(horoscopeText);

		return wrapper;
	},

	scheduleUpdate: function(delay) {
		var nextLoad = this.config.updateInterval;
		if (typeof delay !== "undefined" && delay >= 0) {
			nextLoad = delay;
		}

		var self = this;
		setTimeout(function() {
			self.updateHoroscope();
		}, nextLoad);
	}
});