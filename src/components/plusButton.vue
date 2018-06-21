<template>
	<div>
		<div id="plusButton" @click="plusButton()" class="icon has-text-success">
		  <i class="fa fa-plus-circle fa-3x"></i>
		</div>

		<div class="modal plusButton-modal" v-bind:class="{ 'is-active' : modalOpen || $parent.edit }">
		  <div class="modal-background"></div>
		  <div class="modal-card">
		    <header class="modal-card-head">
				<p v-if="$parent.edit" class="modal-card-title has-text-weight-bold has-text-centered">Edit Vehicle</p>
	      		<p v-else class="modal-card-title has-text-weight-bold has-text-centered">Add Vehicle</p>
		    </header>
		    <section class="modal-card-body">
		      <div class="field is-horizontal">
		        <div class="field-label is-normal">
		          <label class="label">Vehicle Name</label>
		        </div>
		        <div class="field-body">
		          <div class="field">
		            <div class="control">
		              <input v-model="name" class="input" type="text" placeholder="Eg. Alto">
		            </div>
		          </div>
		        </div>
		      </div>
		      <div class="field is-horizontal">
		        <div class="field-label is-normal">
		          <label class="label">Vehicle Number</label>
		        </div>
		        <div class="field-body">
		          <div class="field">
		            <div class="control">
		              <input v-model="number" class="input" type="number" maxlength="4" min="0000" max="9999" placeholder="Eg. 0561" oninput="this.value=this.value.slice(0,this.maxLength)">
		            </div>
		          </div>
		        </div>
		      </div>
		      <div class="field is-horizontal">
		        <div class="field-label is-normal">
		          <label class="label">Vehicle Type</label>
		        </div>
		        <div class="field-body">
		          <div class="field">
		            <div class="select">
		              <select v-model="type">
		                <option value="1">4 Wheel</option>
		                <option value="2">2 Wheel</option>
		              </select>
		            </div>
		          </div>
		        </div>
		      </div>
		    </section>
		    <footer class="modal-card-foot">
		      <button v-if="!this.$parent.edit" class="button is-success" @click="addVehicle()">Add</button>
		      <button v-else @click="updateVehicle()" class="button is-success">Update</button>
		      <button class="button cancel is-danger" @click="closeModal()">Cancel</button>
		    </footer>
		  </div>
		</div>
	</div>
</template>

<script>
	export default {
		data() {
			return {
				modalOpen: false,
				name: "",
				number: "",
				type: 1,
				id: null
			}
		},
		mounted() {
			const self = this;
			this.$parent.$on('edit', function(v) {
				const vehicles = JSON.parse(v);
				self.name = vehicles.name;
				self.number = vehicles.number;
				self.type = vehicles.type;
				self.id = vehicles.id;
			});
		},
		methods: {
		    plusButton: function() {
		    	if (!this.modalOpen) {
		    		this.$parent.edit = false;
		    		this.modalOpen = true;
		    	}
		    },
		    closeModal: function() {
		    	if (this.modalOpen) {
		    		this.modalOpen = false;
		    	} else if (this.$parent.edit) {
		    		this.$parent.edit = false;
		    	}
		    	this.clearInput();
		    },
		    addVehicle: function() {
		    	if (this.name.length > 0 && this.number.length > 0) {
		    		const vehicle = {
		    			id: (this.$parent.vehicles.length > 0) ? this.$parent.vehicles[this.$parent.vehicles.length - 1].id + 1 : 1,
		    			name: this.name,
		    			number: this.number,
		    			type: this.type,
		    		}
		    		this.$parent.vehicles.push(vehicle); // Add to vehicles
		    		this.addVehicleToStorage(vehicle); // Add to storage
		    		// Clear and default all inputs
		    		this.clearInput();
		    		this.modalOpen = false; // CLose modal
		    	}
		    },
		    addVehicleToStorage: function(vehicle) {
		    	const vehicles = (localStorage.getItem('vehicles')) ? JSON.parse(localStorage.getItem('vehicles')) : [];
		    	vehicles.push(vehicle);
		    	localStorage.setItem('vehicles', JSON.stringify(vehicles));
		    	this.$parent.updateNotification();
		    },
		    clearInput: function() {
		    	this.name = this.number = "";
		    	this.type = 1;
		    },
		    updateVehicle: function() {
		    	const vehicles = JSON.parse(localStorage.getItem('vehicles'));
		    	vehicles.forEach(v => {
		    		if (v.id == this.id) {
		    			v.name = this.name;
		    			v.number = this.number;
		    			v.type = this.type;
		    		}
		    	});
		    	localStorage.setItem('vehicles', JSON.stringify(vehicles));
		    	this.$parent.edit = false;
		    	this.clearInput();
		    	this.$parent.loadVehicles();
		    	this.$parent.updateNotification();
		    }
		}
	}
</script>