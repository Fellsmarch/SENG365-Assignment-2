<template>
    <div>
        <b-container fluid>
            <b-row>
                <!--City filter dropdown-->
                <b-col md="2" class="my-1">
                    <b-form-group label="Select City:">
                        <b-input-group>
                            <b-form-select v-model="selectedCity" :options="cityOptions" v-on:change="getVenues">
                                <option slot="first" :value="null">--Select City--</option>
                            </b-form-select>
                        </b-input-group>
                    </b-form-group>
                </b-col>

                <!--Categories filter dropdown-->
                <b-col md="2" class="my-1">
                    <b-form-group label="Select Category:">
                        <b-input-group>
                            <b-form-select v-model="selectedCategoryId" :options="categories" v-on:change="getVenues">
                                <option slot="first" :value="null">--Select Category--</option>
                            </b-form-select>
                        </b-input-group>
                    </b-form-group>
                </b-col>

                <!--Filter bar-->
                <b-col md="2" class="my-1">
                    <b-form-group label="Filter:">
                        <b-input-group>
                            <b-form-input v-model="filter" placeholder="Type to Search​" v-on:click="filter = ''" v-on:input="getVenues"></b-form-input>
                            <b-input-group-append>
                                <b-button :disabled="!filter" @click="filter = ''" v-on:click="getVenues">Clear</b-button>
                            </b-input-group-append>
                        </b-input-group>
                    </b-form-group>
                </b-col>

                <!--Max Cost Rating-->
                <b-col md="2" class="my-1">
                    <b-form-group label="Max Cost Rating:">
                        <b-form-select v-model="selectedCost" :options="costOptions" v-on:change="getVenues">
                            <option slot="first" :value="null">--Select Max Cost--</option>
                        </b-form-select>
                    </b-form-group>
                </b-col>

                <!--Min Star Rating-->
                <b-col md="2" class="my-1">
                    <b-form-group label="Min Star Rating:">
                        <star-rating v-model="selectedStarRating" :round-star-rating="false" :star-size="25" style="font-size: 1rem;" @rating-selected="getVenues"></star-rating>
                    </b-form-group>
                </b-col>

                <b-col class="buttons">
                    <b-button v-on:click="clearFilters">
                        Clear Filters
                    </b-button>
                </b-col>

                <b-col class="buttons">
                    <b-button v-on:click="newVenueFunc" variant="primary">
                        Add Venue
                    </b-button>
                </b-col>
            </b-row>

            <b-table
                id="venuesTable"
                striped
                hover
                :items="items"
                :fields="fields"
                :busy="isBusy"
                outlined
                :per-page="perPage"
                :current-page="currentPage"
                :sort-by.sync="meanStarRating">

                <template slot="details" slot-scope="row">
                    <b-button size="sm" class="mr-1">
                        <router-link :to="{ name: 'venue', params: { venueId: row.item.venueId } }" class="link">Details</router-link>
                    </b-button>
                </template>

                <template slot="primaryPhoto" slot-scope="row">
                    <div v-if="row.item.photoUrl">
                        <b-img :src="row.item.photoUrl" fluid v-bind="imageSize"></b-img>
                    </div>

                    <div v-else>
                        <b-img :src="defaultImage" fluid v-bind="imageSize"></b-img>
                    </div>
                </template>

                <template slot="meanStarRating" slot-scope="row">
                    <star-rating :rating="row.item.meanStarRating" :round-star-rating="false" :read-only="true" :increment="0.1" :star-size="25"></star-rating>
                </template>

                <div slot="table-busy" class="text-center text-danger my-2">
                    <b-spinner class="align-middle"></b-spinner>
                    <strong>Loading...</strong>
                </div>
            </b-table>

            <p class="mt-3">Current Index: {{ currentIndex }}</p>

            <b-pagination
                v-model="currentPage"
                :total-rows="totalRows"
                :per-page="perPage"
                aria-controls="venuesTable">
            </b-pagination>
        </b-container>

        <b-modal id="newVenueModal"
                 ref="newVenueModal"
                 title="Add New Venue"
                 size="lg"
                 centered
                 @ok="handleOk"
                 @show="resetModal"
                 @hidden="resetModal">
            <b-container fluid>
                <b-form @submit.stop.prevent="handleSubmit" ref="newVenueForm">
                    <b-form-group id="input-group-1" label-for="input-1" invalid-feedback="Venue name is required">
                        <b-form-input
                            id="input-1"
                            v-model="newVenue.venueName"
                            required
                            :state="formState.venueName"
                            placeholder="Venue Name"
                        ></b-form-input>
                    </b-form-group>

                    <b-form-group id="input-group-2" label-for="input-2" invalid-feedback="Category is required">
                        <b-form-select v-model="newVenue.categoryId"
                                       :options="categories"
                                       :state="formState.category">
                            <option slot="first" :value="null">--Select Category--</option>
                        </b-form-select>
                    </b-form-group>

                    <b-form-group id="input-group-3" label-for="input-3" invalid-feedback="Short description is required">
                        <b-form-input
                            id="input-3"
                            v-model="newVenue.shortDescription"
                            required
                            :state="formState.shortDescription"
                            placeholder="Short Description"
                        ></b-form-input>
                    </b-form-group>

                    <b-form-group id="input-group-4" label-for="input-4" invalid-feedback="Long description is required">
                        <b-form-input
                            id="input-4"
                            v-model="newVenue.longDescription"
                            required
                            :state="formState.longDescription"
                            placeholder="Long Description"
                        ></b-form-input>
                    </b-form-group>

                    <b-form-group id="input-group-5" invalid-feedback="City is required">
                        <b-form-input
                            id="input-5"
                            v-model="newVenue.city"
                            required
                            :state="formState.city"
                            placeholder="City"
                        ></b-form-input>
                    </b-form-group>

                    <b-form-group id="input-group-6" invalid-feedback="Address is required">
                        <b-form-input
                            id="input-6"
                            v-model="newVenue.address"
                            required
                            :state="formState.address"
                            placeholder="Address"
                        ></b-form-input>
                    </b-form-group>

                    <b-form-group id="input-group-7" invalid-feedback="Latitude must be between -90 & 90">
                        <b-form-input
                            id="input-7"
                            type="number"
                            v-model="newVenue.latitude"
                            required
                            :state="formState.latitude"
                            max="90"
                            min="-90"
                            placeholder="Latitude"
                        ></b-form-input>
                    </b-form-group>

                    <b-form-group id="input-group-8" invalid-feedback="Latitude must be between -180 & 180">
                        <b-form-input
                            id="input-8"
                            type="number"
                            v-model="newVenue.longitude"
                            required
                            :state="formState.longitude"
                            max="180"
                            min="-180"
                            placeholder="Longitude"
                        ></b-form-input>
                    </b-form-group>
                </b-form>

                <!--<b-card class="mt-3" header="Form Data Result">-->
                    <!--<pre class="m-0">{{ newVenue }}</pre>-->
                <!--</b-card>-->
            </b-container>
        </b-modal>

    </div>
</template>

<script>
    import url from "./url.js";

    export default {
        computed: {
            cityOptions() {
                return [...new Set(this.cities)].sort();
            },
            totalRows() {
                return this.items.length;
            },
            currentIndex() {
                let firstIndex = (this.currentPage - 1) * this.perPage + 1;
                let secondIndex = this.currentPage * this.perPage;

                if (secondIndex > this.items.length) {
                    secondIndex = (this.currentPage - 1) * this.perPage + (this.items.length % this.perPage);
                }
                return "" + firstIndex + "-" + secondIndex;
            }

        },
        data() {
            return {
                fields: {
                    venueName: {
                        label: "Name",
                        sortable: true
                    },
                    categoryName: {
                        label: "Category",
                        sortable: true,
                        key: "category.categoryName"
                    },
                    city: {
                        label: "City",
                        sortable: true,
                    },
                    shortDescription: {
                        label: "Description",
                        sortable: false
                    },
                    meanStarRating: {
                        label: "Star Rating",
                        sortable: true
                    },
                    modeCostRating: {
                        label: "Cost",
                        sortable: true,
                        formatter: value => {
                            if (value === 0) {
                                return "Free";
                            } else {
                                return "$".repeat(value);
                            }
                        }
                    },
                    primaryPhoto: {
                        label: "Photo",
                        sortable: false
                    },
                    details: {
                        label: "Details",
                        sortable: false
                    }
                },
                items: [],
                isBusy: true,
                filter: "",
                selectedCity: null,
                selectedCategoryId: null,
                selectedCost: null,
                selectedStarRating: null,
                cities: [],
                imageSize: {width: 75, height: 75},
                defaultImage: require("./assets/default.png"),
                newVenue: {
                    venueName: null,
                    categoryId: null,
                    shortDescription: null,
                    longDescription: null,
                    city: null,
                    address: null,
                    latitude: null,
                    longitude: null
                },
                formState: {
                    venueName: null,
                    category: null,
                    shortDescription: null,
                    longDescription: null,
                    city: null,
                    address: null,
                    latitude: null,
                    longitude: null
                },
                categories: [],
                currentPage: 1,
                perPage: 10,
                costOptions: [
                    {value: 4, text: "$$$$"},
                    {value: 3, text: "$$$"},
                    {value: 2, text: "$$"},
                    {value: 1, text: "$"},
                    {value: 0, text: "Free"}
                ],
            }
        },
        mounted: function() {
            this.$cookies.remove("previous_page");
            this.getVenues();
            this.getCategories();
        },
        methods: {
            getVenues: function() {
                let vueComp = this;

                let queryParams = this.getQueryParams();

                this.$http.get(url + "/venues", {params: queryParams})
                    .then(function(response) {
                        let venues = response.body;
                        console.log(venues);
                        let promises = [];

                        for (let i = 0; i < venues.length; i++) {
                            promises.push(this.$http.get(url + "/venues/" + venues[i].venueId));
                        }

                        Promise.all(promises).then(function(values) {
                            let tempVenues = [];

                            for (let i = 0; i < values.length; i++) {
                                let toPush = values[i].body;

                                vueComp.cities.push(toPush.city);

                                if (venues[i].meanStarRating) {
                                    toPush.meanStarRating = venues[i].meanStarRating;
                                } else {
                                    toPush.meanStarRating = 3;
                                }

                                if (venues[i].modeCostRating) {
                                    toPush.modeCostRating = venues[i].modeCostRating;
                                } else {
                                    toPush.modeCostRating = 0;
                                }

                                toPush.venueId = venues[i].venueId;

                                if (venues[i].primaryPhoto) {
                                    toPush.photoUrl = url + "/venues/" + venues[i].venueId + "/photos/" + venues[i].primaryPhoto;
                                }

                                tempVenues.push(toPush);
                            }

                            vueComp.items = tempVenues;
                            vueComp.isBusy = false;
                        }, function(errors) {
                            console.log(errors);
                        });
                    }, function(error) {
                        this.$bvToast.toast("Error: " + error.statusText, {
                            title: "Error",
                            autoHideDelay: 3000,
                        });
                    });
            },

            getQueryParams: function() {
                let queryParams = {};

                if (this.filter) {
                    queryParams.q = this.filter;
                }

                if (this.selectedCity) {
                    queryParams.city = this.selectedCity;
                }

                if (this.selectedCategoryId) {
                    queryParams.categoryId = this.selectedCategoryId;
                }

                if (this.selectedCost || this.selectedCost === 0) {
                    queryParams.maxCostRating = this.selectedCost;
                }

                if (this.selectedStarRating) {
                    queryParams.minStarRating = this.selectedStarRating;
                }

                return queryParams;
            },

            getCategories: function() {
                this.$http.get(url + "/categories")
                    .then(function(response) {
                        let body = response.body;
                        let categories = [];

                        for (let i = 0; i < body.length; i++) {
                            let category = body[i];
                            categories.push({
                                value: category.categoryId,
                                text: category.categoryName
                            });
                        }

                        this.categories = categories;
                    }, function(error) {
                        this.$bvToast.toast("Error getting categories: " + error.statusText, {
                            title: "Error getting categories",
                            autoHideDelay: 3000,
                        });
                    });
            },

            clearFilters: function() {
                this.filter = null;
                this.selectedCity = null;
                this.selectedCategoryId = null;
                this.selectedCost = null;
                this.selectedStarRating = null;
                this.getVenues();
            },

            newVenueFunc: function() {
                if (!this.$cookies.isKey("user_session")) {
                    this.$cookies.set("previous_page", this.$router.currentRoute.fullPath + "/add");
                    this.$router.push("/login");
                } else {
                    this.$nextTick(() => {this.$refs.newVenueModal.show()});
                }
            },

            handleSubmit() {
                if (this.checkForm()) {
                    this.newVenue.latitude = Number(this.newVenue.latitude);
                    this.newVenue.longitude = Number(this.newVenue.longitude);

                    this.$nextTick(() => {this.$refs.newVenueModal.hide()});

                    let config = {
                        headers: {
                            "X-Authorization": this.$cookies.get("user_session")
                        }
                    };

                    this.$http.post(url + "/venues", JSON.stringify(this.newVenue), config)
                        .then(function(response) {
                            this.$bvToast.toast("Venue created!", {
                                title: "SUCCESS",
                                autoHideDelay: 3000,
                            });
                            this.getVenues();
                        }, function(error) {
                            if (error.status === 401) {
                                this.$cookies.remove("user_session");
                                this.$cookies.remove("user_id");
                                this.$cookies.remove("username");
                                alert("ERROR: You must be logged in to create a venue!");
                            }
                        });
                }
            },

            handleOk(bvModalEvt) {
                bvModalEvt.preventDefault();
                this.handleSubmit();
            },

            checkForm() {
                const valid = this.$refs.newVenueForm.checkValidity();
                if (this.$refs.newVenueForm.checkValidity()) {
                    Object.keys(this.formState).forEach(v => this.formState[v] = true);
                } else {
                    this.formState.venueName = !!this.newVenue.venueName;
                    this.formState.shortDescription = !!this.newVenue.shortDescription;
                    this.formState.longDescription = !!this.newVenue.longDescription;
                    this.formState.city = !!this.newVenue.city;
                    this.formState.address = !!this.newVenue.address;
                    this.formState.latitude = (this.newVenue.latitude <= 90 && this.newVenue.latitude >= -90 && this.newVenue.latitude != null);
                    this.formState.longitude = (this.newVenue.longitude <= 180 && this.newVenue.longitude >= -180 && this.newVenue.longitude != null);
                    this.formState.category = !!this.newVenue.categoryId;
                }

                return valid && this.newVenue.categoryId != null;
            },

            resetModal() {
                 Object.keys(this.newVenue).forEach(v => this.newVenue[v] = null);
                 Object.keys(this.formState).forEach(v => this.formState[v] = null);
            }
        }
    }
</script>

<style scoped>
    .buttons {
        padding-top: 0.885rem;
        margin: auto;
    }
</style>
