import Vue from 'vue'
import App from './App.vue'

Vue.config.productionTip = false

window.tlanni = new Vue({
  render: h => h(App)
}).$mount('#app')

// Get the options
const options = JSON.parse(localStorage.getItem('options'));

window.checkMotorTlanni = function() {
	let tlanlohni = [];
	const date = new Date();

	if (localStorage.getItem('vehicles')) {
		const vehicles = JSON.parse(localStorage.getItem('vehicles'));
		let theDate = (date.getDate().toString() > 1) ? (date.getDate() % 10) : date.getDate();
		vehicles.forEach(v => {
			if (date.getHours() > options.notificationsTime) {
				// Display data for tomorrow as there is no more time
				if (theDate == 9) {
					theDate = 0;
				} else {
					theDate = theDate + 1;
				}
			}
			if (theDate == (v.number % 10)) {
				// Motor tlanni
				tlanlohni.push(v);
			}
		});
	}

	if (tlanlohni.length > 0) {
		return tlanlohni;
	} else {
		return [];
	}
}

window.parseToString = function(v) {
	let str = [];
	v.forEach(vh => {
		str.push(vh.name + " - " + vh.number);
	});
	return str.join('\n');
}

// Cordova function
document.addEventListener('deviceready', function() {
	tlanni.$children[0].deviceReady = true;

	cordova.plugins.notification.local.isPresent(0, function(present) {
		if (!present && options.notifications) {
			// If notification not present
			cordova.plugins.notification.local.schedule({
				id: 0,
			    title: (checkMotorTlanni().length > 0) ? checkMotorTlanni().length + " tlanlohni" : "Tlanni",
			    text: (checkMotorTlanni().length > 0) ? parseToString(checkMotorTlanni()) : "I motor zawng zawng an tlan thei vek e",
			    smallIcon: 'file://icon.png',
			    trigger: { every: { hour: parseFloat(options.notificationsTime), minute: 0 }, count: 1 },
			});	
		}
	});

	// Back button behaviour
	document.addEventListener("backbutton", function() {
		if (tlanni.$children[0].edit) {
			tlanni.$children[0].edit = false;
			tlanni.$children[0].$children[0].clearInput();
		} else if (tlanni.$children[0].$children[0].modalOpen) {
			tlanni.$children[0].$children[0].modalOpen = false;
			tlanni.$children[0].$children[0].clearInput();
		} else {
			navigator.app.exitApp();
		}
	}, false);
});
