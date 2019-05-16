<template>
    <div>
        <b-container fluid>
            <b-row>
                <!--City filter dropdown-->
                <b-col md="2" class="my-1">
                    <b-form-group label-cols-sm="4" label="Select City:" class="mb-1">
                        <b-input-group>
                            <b-form-select v-model="selectedCity" :options="cityOptions" v-on:change="filter = 'Type to Search​'">
                                <option slot="first" :value="null">--Select City--</option>
                            </b-form-select>
                        </b-input-group>
                    </b-form-group>
                </b-col>

                <!--Filter bar-->
                <b-col md="2" class="my-1">
                    <b-form-group label-cols-sm="2" label="Filter:" class="mb-1">
                        <b-input-group>
                            <b-form-input v-model="filter" placeholder="Type to Search​" v-on:click="filter = ''"></b-form-input>
                            <b-input-group-append>
                                <!--<b-button :disabled="!filter" @click="filter = ''">Clear</b-button>-->
                            </b-input-group-append>
                        </b-input-group>
                    </b-form-group>
                </b-col>
            </b-row>



            <b-table
                striped
                hover
                :items="items"
                :fields="fields"
                :busy="isBusy"
                outlined
                :filter="filter"
                :filter-function="nameFilter">

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

                <div slot="table-busy" class="text-center text-danger my-2">
                    <b-spinner class="align-middle"></b-spinner>
                    <strong>Loading...</strong>
                </div>
            </b-table>
        </b-container>

    </div>
</template>

<script>
    import url from "./url.js";

    export default {
        computed: {
            cityOptions() {
                return [...new Set(this.cities)].sort();
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
                filter: "Type to Search​",
                selectedCity: null,
                cities: [],
                imageSize: {width: 75, height: 75},
                defaultImage: require("./assets/default.png"),
            }

        },
        mounted: function() {
            let vueComp = this;
            this.$http.get(url + "/venues")
                .then(function(response) {
                    let venues = response.body;
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
                    alert(error.statusText);
                });
        },
        methods: {
            nameFilter: function(data, string) {
                if (string === "Type to Search​") {
                    string = "";
                }
                if (this.selectedCity != null) {
                    if (this.filter == null || this.filter === '') {
                        return data.city === this.selectedCity;
                    } else {
                        return data.city === this.selectedCity && data.venueName.includes(string);
                    }
                } else {
                    return data.venueName.includes(string);
                }
            },

        }
    }
</script>
