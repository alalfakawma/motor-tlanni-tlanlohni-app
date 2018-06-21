<template>
  <div id="app" class="container-fluid">
    <div class="tabs is-fullwidth options-field">
      <ul>
        <li class="options-field-button" v-bind:class="{ 'is-active' : state == 1 }" data-button-state="1" @click="fieldButton($event)">
          <a>
            <span class="icon is-small"><i class="fa fa-globe" aria-hidden="true"></i></span>
            <span>Overview</span>
          </a>
        </li>
        <li class="options-field-button" v-bind:class="{ 'is-active' : state == 2 }" data-button-state="2" @click="fieldButton($event)">
          <a>
            <span class="icon is-small"><i class="fa fa-gear" aria-hidden="true"></i></span>
            <span>Options</span>
          </a>
        </li>
      </ul>
    </div>

    <div v-bind:class="{'is-hidden' : state == 2}" class="overview" data-state="1">
      <div v-if="options.date" class="title is-6 has-text-centered has-text-primary">{{ dateString }}</div>
      <plusButton></plusButton>

      <nav class="panel">
        <div v-for="vehicle in vehicles" class="panel-block vehicle" v-bind:class="{ 'is-tlanlohni' : ((date.getDate().toString() > 1) ? (date.getDate() % 10) : date.getDate()) == (vehicle.number % 10) }" :data-vehicle-id="vehicle.id" style="justify-content: space-between;">
          <div>
            <div v-if="options.vicons" class="icon is-small m-r-10">
                <i class="fa" v-bind:class="{ 'fa-car' : vehicle.type == 1, 'fa-bicycle' : vehicle.type == 2 }" aria-hidden="true"></i>
              </div>
              {{vehicle.name}} - <span class="has-text-weight-bold">{{vehicle.number}}</span>
            </div>
            <div>
            <div @click="editVehicle($event)" class="button is-small is-link m-r-5" :data-vehicle="JSON.stringify(vehicle)">
              <i class="fa fa-pencil"></i>
            </div>
            <div @click="removeVehicle(vehicle.id)" class="button is-small is-danger">
              <i class="fa fa-trash"></i>
            </div>
          </div>
        </div>
      </nav>
      <div v-if="vehicles.length <= 0" class="displayText">
        Press the <i class="fa fa-plus"></i> button to add vehicles.
      </div>
    </div>
    <div v-bind:class="{'is-hidden' : state == 1}" class="options" data-state="2">
          <div class="options-holder">
            <div class="pretty p-switch p-fill option-button m-b-20">
              <input class="option-checkbox" :disabled="!deviceReady" v-on:change="updateOptions()" v-model:checked="options.notifications" type="checkbox"/>
              <div class="state p-success">
                  <label class="has-text-weight-bold">Enable Push Notifications</label>
              </div>
            </div>
            <div class="m-b-20" v-if="options.notifications">
              <label class="label is-small">Time for notification :</label>
              <div class="control">
                <input type="number" :disabled="!deviceReady" class="input is-small notification-time" min="0" max="24" @change="fixTime($event)" style="width: 10%;" v-model="options.notificationsTime">
                <small class="help is-danger">24 Hour format</small>
              </div>
            </div>
            <div class="pretty p-switch p-fill option-button m-b-20">
                <input class="option-checkbox" :disabled="!deviceReady" v-on:change="updateOptions()" v-model:checked="options.vicons" type="checkbox"/>
                <div class="state p-success">
                    <label class="has-text-weight-bold">Show Vehicle Icons</label>
                </div>
            </div>
            <div class="pretty p-switch p-fill option-button m-b-20">
                <input class="option-checkbox" :disabled="!deviceReady" v-on:change="updateOptions()" v-model:checked="options.date" type="checkbox"/>
                <div class="state p-success">
                    <label class="has-text-weight-bold">Show Date</label>
                </div>
            </div>
          </div>
        </div>
    </div>
  </div>
</template>

<script>
import plusButton from "./components/plusButton.vue"

// Constants
const STATES = {
  "overview": 1,
  "options": 2
}
const TYPE = {
  "fourwheel": 1,
  "twowheel": 2,
}

export default {
  name: 'app',
  data() {
    return {
      state: STATES.overview, // Default state
      options: {
        notifications: true, // Notification option
        notificationsTime: 9, // Default time
        vicons: true, // Vehicle Icons option
        date: true,
      },
      edit: false, // Edit mode
      vehicles: [],
      date: new Date(),
      deviceReady: false,
    }
  },
  computed: {
    dateString: function() {
      return this.date.getDate() + "-" + this.date.toLocaleString("en-us", { month: "long" }) + "-" + this.date.getFullYear();
    }
  },
  components: {
    plusButton
  },
  created() {
    // Run created functions
    this.loadOptions();
    this.loadVehicles();
  },
  methods: {
    fieldButton: function(e) {
      this.state = e.currentTarget.getAttribute('data-button-state'); // Set state
    },
    editVehicle: function(e) {
      this.edit = true;
      this.$emit('edit', e.currentTarget.getAttribute('data-vehicle'));
    },
    removeVehicle: function(id) {
      this.vehicles.forEach(v => {
        if (v.id == id) {
          this.vehicles.splice(this.vehicles.indexOf(v), 1);
          this.removeVehicleFromStorage(v.id);
        }
      });
    },
    removeVehicleFromStorage: function(id) {
      const vehicles = JSON.parse(localStorage.getItem('vehicles'));
      vehicles.forEach(v => {
        if (v.id == id) {
          vehicles.splice(vehicles.indexOf(v), 1);
        }
      });
      localStorage.setItem('vehicles', JSON.stringify(vehicles));
      this.updateNotification();
    },
    loadVehicles: function() {
      const vehicles = (localStorage.getItem('vehicles')) ? JSON.parse(localStorage.getItem('vehicles')) : [];
      this.vehicles = vehicles;
    },
    loadOptions: function() {
      if (!localStorage.getItem('options')) localStorage.setItem('options', JSON.stringify(this.options));
      if (localStorage.getItem('options')) this.options = JSON.parse(localStorage.getItem('options'));
    },
    updateOptions: function(notTime = false) {
      const self = this;
      localStorage.setItem('options', JSON.stringify(this.options));
      if (this.deviceReady) {
        cordova.plugins.notification.local.isPresent(0, function (present) {
            if (present && !self.options.notifications) {
              cordova.plugins.notification.local.cancel(0);
            } else if (!present && self.options.notifications) {
              // If notification is not available
              cordova.plugins.notification.local.schedule({
                  id: 0,
                  title: (checkMotorTlanni().length > 0) ? checkMotorTlanni().length + " tlanlohni" : "Tlanni",
                  text: (checkMotorTlanni().length > 0) ? parseToString(checkMotorTlanni()) : "I motor zawng zawng an tlan thei vek e",
                  smallIcon: 'res://icon.png',
                  trigger: { every: { hour: parseFloat(self.options.notificationsTime), minute: 0 }, count: 1 },
              });
            } else if (present && self.options.notifications) {
              if (notTime) {
                // Time has been changed
                cordova.plugins.notification.local.isPresent(0, function(present) {
                  if (present) {
                    // If present, cancel and re-add
                    cordova.plugins.notification.local.cancel(0);
                    cordova.plugins.notification.local.schedule({
                        id: 0,
                        title: (checkMotorTlanni().length > 0) ? checkMotorTlanni().length + " tlanlohni" : "Tlanni",
                        text: (checkMotorTlanni().length > 0) ? parseToString(checkMotorTlanni()) : "I motor zawng zawng an tlan thei vek e",
                        smallIcon: 'res://icon.png',
                        trigger: { every: { hour: parseFloat(self.options.notificationsTime), minute: 0 }, count: 1 },
                    });
                  }
                });
              }
            }
        });
      }
    },
    fixTime: function(e) {
      const target = e.currentTarget;
      if (parseFloat(e.currentTarget.value) >= 23) {
        this.options.notificationsTime = 23;
      } else if (parseFloat(e.currentTarget.value) <= 0) {
        this.options.notificationsTime = 0;
      }
      this.updateOptions(true);
    },
    updateNotification: function() {
      // Update the notification when changes occur so it will
      // stay updated and not show irrelevant data
      cordova.plugins.notification.local.isPresent(0, function(present) {
        if (present) {
          cordova.plugins.notification.local.update({
              id: 0,
              title: (checkMotorTlanni().length > 0) ? checkMotorTlanni().length + " tlanlohni" : "Tlanni",
              text: (checkMotorTlanni().length > 0) ? parseToString(checkMotorTlanni()) : "I motor zawng zawng an tlan thei vek e",
          });
        }
      });
    }
  }
}
</script>
