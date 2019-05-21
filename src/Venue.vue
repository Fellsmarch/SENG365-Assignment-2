<template>
    <div>
        <b-container fluid>
            <b-row>
                <!--Venue information and primary photo-->
                <b-col sm="4">
                    <div id="loading" class="text-center" v-if="!loadingComplete">
                        <b-spinner class="align-middle "></b-spinner>
                        <strong>Loading...</strong>
                    </div>

                    <b-row id="venueInfo">
                        <div v-if="primaryPhotoUrl">
                            <b-img  :src="primaryPhotoUrl" fluid v-bind="imageSize"></b-img>
                        </div>
                        <div v-else>
                            <b-img src="/src/assets/default.png" fluid v-bind="imageSize"></b-img>
                        </div>

                        <div id="venueTitles" v-if="loadingComplete">
                            <h1>{{ venueData.venueName }}</h1>
                            <h3>{{ venueData.category.categoryName }}</h3>
                            <h4>{{ venueData.city }}</h4>
                        </div>
                    </b-row>

                    <div v-if="loadingComplete">
                        <b-row align-v="center">
                            <b-col sm="4">
                                <h4>Description: </h4>
                            </b-col>
                            <b-col sm="8">
                                <div class="descriptions" style="transition: all 1s;">
                                    <h5>
                                        {{ description }}
                                        <a class="showMore" v-on:click="showMore()">{{ showText }}</a>
                                    </h5>
                                </div>
                            </b-col>

                        </b-row>

                        <b-row align-v="center">
                            <b-col sm="4">
                                <h4>Address: </h4>
                            </b-col>

                            <b-col sm="8">
                                <h5 class="">{{ venueData.address }}</h5>
                            </b-col>
                        </b-row>

                        <b-row align-v="center">
                            <b-col sm="4">
                                <h4>Date Added: </h4>
                            </b-col>

                            <b-col sm="8">
                                <h5>{{ formattedDate.toString() }}</h5>
                            </b-col>
                        </b-row>

                        <b-row align-v="center">
                            <b-col sm="4">
                                <h4>Admin Username: </h4>
                            </b-col>

                            <b-col sm="8">
                                <h5>{{ venueData.admin.username }}</h5>
                            </b-col>
                        </b-row>

                        <b-row align-v="center">
                            <b-col sm="4">
                                <h4>Star Rating: </h4>
                            </b-col>

                            <b-col sm="8">
                                <star-rating :rating="meanStarRating" :round-star-rating="false" :read-only="true" :increment="0.1" :star-size="25" style="font-size: 1.25rem;"></star-rating>
                            </b-col>
                        </b-row>

                        <b-row align-v="center">
                            <b-col sm="4">
                                <h4>Cost Rating: </h4>
                            </b-col>

                            <b-col sm="8">
                                <h5>{{ modeCostRating }}</h5>
                            </b-col>
                        </b-row>

                        <b-row align-v="center">
                            <b-col sm="4">
                                <b-button id="editButton" v-if="userIsAdmin" variant="primary" v-on:click="editVenue">Edit</b-button>
                            </b-col>
                        </b-row>
                    </div>

                    <!--<b-card class="mt-3" header="Form Data Result">-->
                        <!--<pre class="m-0">{{ venueData }}</pre>-->
                    <!--</b-card>-->
                </b-col>

                <!--Venue photos and reviews-->
                <b-col sm="8">
                    <b-row>
                        <b-card id="photos" header="Photos" border-variant="primary" header-bg-variant="primary" header-text-variant="white">
                            <div>
                                <gallery :images="images" :index="index" @close="index = null"></gallery>
                                <div
                                    class="image"
                                    v-for="(image, imageIndex) in images"
                                    :key="imageIndex"
                                    @click="index = imageIndex"
                                    :style="{ backgroundImage: 'url(' + image + ')', width: '300px', height: '200px' }"
                                ></div>
                            </div>
                        </b-card>
                    </b-row>

                    <b-row>
                        <!--<b-card header="Reviews" border-variant="primary" header-bg-variant="primary" header-text-variant="white">-->
                            <b-table
                                id="reviewsTable"
                                striped
                                hover
                                :items="reviews"
                                :fields="reviewFields"
                                :busy="isBusy"
                                outlined
                                :sort-by.sync="dateTime">

                                <template slot="starRating" slot-scope="row">
                                    <star-rating :rating="row.item.starRating" :round-star-rating="false" :read-only="true" :star-size="15"></star-rating>
                                </template>

                                <div slot="table-busy" class="text-center text-danger my-2">
                                    <b-spinner class="align-middle"></b-spinner>
                                    <strong>Loading...</strong>
                                </div>
                            </b-table>
                        <!--</b-card>-->
                    </b-row>

                </b-col>
            </b-row>
        </b-container>

        <b-modal id="editVenueModal"
                 ref="editVenueModal"
                 title="Edit Venue"
                 size="lg"
                 centered
                 @ok="handleOk"
                 @show="resetModal"
                 @hidden="resetModal">
            <b-container fluid>
                <b-form @submit.stop.prevent="handleSubmit" ref="editVenueForm">
                    <b-form-group id="input-group-1" label-for="input-1" invalid-feedback="Venue name is required">
                        <b-form-input
                            id="input-1"
                            v-model="venueData.venueName"
                            required
                            :state="formState.venueName"
                            placeholder="Venue Name"
                        ></b-form-input>
                    </b-form-group>

                    <b-form-group id="input-group-2" label-for="input-2" invalid-feedback="Category is required">
                        <b-form-select v-model="venueData.category.categoryId"
                                       :options="categories"
                                       :state="formState.category">
                            <option slot="first" :value="null">--Select Category--</option>
                        </b-form-select>
                    </b-form-group>

                    <b-form-group id="input-group-3" label-for="input-3" invalid-feedback="Short description is required">
                        <b-form-input
                            id="input-3"
                            v-model="venueData.shortDescription"
                            required
                            :state="formState.shortDescription"
                            placeholder="Short Description"
                        ></b-form-input>
                    </b-form-group>

                    <b-form-group id="input-group-4" label-for="input-4" invalid-feedback="Long description is required">
                        <b-form-input
                            id="input-4"
                            v-model="venueData.longDescription"
                            required
                            :state="formState.longDescription"
                            placeholder="Long Description"
                        ></b-form-input>
                    </b-form-group>

                    <b-form-group id="input-group-5" invalid-feedback="City is required">
                        <b-form-input
                            id="input-5"
                            v-model="venueData.city"
                            required
                            :state="formState.city"
                            placeholder="City"
                        ></b-form-input>
                    </b-form-group>

                    <b-form-group id="input-group-6" invalid-feedback="Address is required">
                        <b-form-input
                            id="input-6"
                            v-model="venueData.address"
                            required
                            :state="formState.address"
                            placeholder="Address"
                        ></b-form-input>
                    </b-form-group>

                    <b-form-group id="input-group-7" invalid-feedback="Latitude must be between -90 & 90">
                        <b-form-input
                            id="input-7"
                            type="number"
                            v-model="venueData.latitude"
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
                            v-model="venueData.longitude"
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
        },

        data() {
            return {
                imageSize: {width: 200, height: 200},
                venueData: {photos: null, },
                primaryPhoto: null,
                loadingComplete: false,
                primaryPhotoUrl: null,
                formattedDate: null,
                meanStarRating: null,
                modeCostRating: null,
                images: [],
                index: null,
                detailsShowing: false,
                description: null,
                showText: "More",
                isBusy: true,
                reviews: [],
                reviewFields: {
                    username: {
                        label: "Reviewer",
                        sortable: false
                    },
                    dateTime: {
                        label: "Posted",
                        sortable: true,
                        formatter: value => {
                            let dateOptions = { year: 'numeric', month: 'short', day: 'numeric'};
                            return value.toLocaleTimeString('en-NZ', dateOptions);
                        }
                    },
                    reviewBody: {
                        label: "Review Text",
                        sortable: false,
                        class: "reviewBody"
                    },
                    starRating: {
                        label: "Star Rating",
                        sortable: true
                    },
                    costRating: {
                        label: "Cost Rating",
                        sortable: true,
                        formatter: value => {
                            if (value === 0) {
                                return "Free";
                            } else {
                                return "$".repeat(value);
                            }
                        }
                    },
                },
                userIsAdmin: false,
                categories: [],
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
                venueDataCopy: {},
                changesMade: false,
            }
        },

        mounted: function() {
            this.$cookies.remove("previous_page");
            this.getCategories();
            this.getVenue();
        },

        methods: {
            getVenue: function() {
                this.changesMade = false;
                this.$http.get(url + "/venues/" + this.$route.params.venueId)
                    .then(function(response) {
                        this.venueData = response.body;
                        this.userIsAdmin = this.venueData.admin.userId == this.$cookies.get("user_id"); //Double equals intentional here as types can be different so I just ignore them

                        for (let i = 0; i < this.venueData.photos.length; i++) {
                            let photo = this.venueData.photos[i];

                            let photoUrl = url + "/venues/" + this.$route.params.venueId + "/photos/" + photo.photoFilename;

                            if (photo.isPrimary) {
                                this.primaryPhoto = photo;
                                this.primaryPhotoUrl = photoUrl;
                            }

                            this.images.push(photoUrl);
                        }

                        if (this.venueData.longDescription) {
                            this.description = this.venueData.shortDescription + "...";
                        } else {
                            this.description = this.venueData.shortDescription
                        }

                        let jsDate = new Date(this.venueData.dateAdded);
                        let dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'};
                        this.formattedDate = jsDate.toLocaleDateString('en-NZ', dateOptions);

                        let queryParameters = {
                            // city: this.venueData.city,
                            adminId: this.venueData.admin.userId,
                            q: this.venueData.venueName,
                            categoryId: this.venueData.category.categoryId
                        };

                        this.$http.get(url + "/venues", {params: queryParameters})
                            .then(function(venuesResponse) {
                                let venues = venuesResponse.body;
                                for (let i = 0; i < venues.length; i++) {
                                    let venue = venues[i];
                                    if (venue.venueId.toString() == this.$route.params.venueId) { //Double equals instead of triple is intentional as I don't care about type conversion

                                        if (!venue.meanStarRating) {
                                            this.meanStarRating = 3;
                                        } else {
                                            this.meanStarRating = venue.meanStarRating;
                                        }

                                        if (!venue.modeCostRating) {
                                            this.modeCostRating = "Free";
                                        } else {
                                            this.modeCostRating = "$".repeat(venue.modeCostRating);
                                        }
                                        break;
                                    }
                                }

                                this.getReviews();
                            }, function(venuesError) {
                                this.$bvToast.toast("Error getting venue ratings: " + venuesError.statusText, {
                                    title: "Error",
                                    autoHideDelay: 3000,
                                });
                            });
                        this.loadingComplete = true;


                    }, function(error) {
                        this.$bvToast.toast("Error: " + error.statusText, {
                            title: "Error",
                            autoHideDelay: 3000,
                        });
                    });
            },

            showMore: function() {
                if (this.detailsShowing) {
                    if (this.venueData.longDescription) {
                        this.description = this.venueData.shortDescription + "...";
                    } else {
                        this.description = this.venueData.shortDescription
                    }

                    this.showText = "More";
                } else {
                    this.description = this.venueData.shortDescription + " " + this.venueData.longDescription;
                    this.showText = "Less";
                }

                this.detailsShowing = !this.detailsShowing
            },

            getReviews: function() {
                this.$http.get(url + "/venues/" + this.$route.params.venueId + "/reviews")
                    .then(function (response) {
                        let reviews = response.body;

                        for (let i = 0; i < reviews.length; i++) {
                            let review = reviews[i];

                            this.reviews.push({
                                username: review.reviewAuthor.username,
                                reviewBody: review.reviewBody,
                                starRating: review.starRating,
                                costRating: review.costRating,
                                dateTime: new Date(review.timePosted)
                            });
                        }

                        this.isBusy = false;
                    }, function (error) {
                        this.$bvToast.toast("Error getting reviews: " + error.statusText, {
                            title: "Error",
                            autoHideDelay: 3000,
                        });
                    });
            },

            editVenue: function() {
                if (!this.$cookies.isKey("user_session")) {
                    this.$cookies.set("previous_page", this.$router.currentRoute.fullPath);
                    this.$router.push("/login");
                } else {
                    this.venueDataCopy = JSON.stringify(this.venueData);
                    this.$nextTick(() => {this.$refs.editVenueModal.show()});
                }
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

            handleSubmit() {
                if (this.checkForm()) {
                    this.venueData.latitude = Number(this.venueData.latitude);
                    this.venueData.longitude = Number(this.venueData.longitude);

                    this.$nextTick(() => {this.$refs.editVenueModal.hide()});

                    let config = {
                        headers: {
                            "X-Authorization": this.$cookies.get("user_session")
                        }
                    };

                    this.$http.patch(url + "/venues/" + this.$route.params.venueId, JSON.stringify(this.venueData), config)
                        .then(function(response) {
                            this.$bvToast.toast("Venue successfully changed!", {
                                title: "SUCCESS",
                                autoHideDelay: 3000,
                            });
                            this.changesMade = true;
                            this.getVenues();
                        }, function(error) {
                            if (error.status === 401) {
                                this.$cookies.remove("user_session");
                                this.$cookies.remove("user_id");
                                this.$cookies.remove("username");
                                alert("ERROR: You must be logged in to create a venue!");
                            } else if (error.status === 403) {
                                this.$bvToast.toast("You are not the administrator of this venue!", {
                                    title: "Error",
                                    autoHideDelay: 3000,
                                });
                            } else if (error.status === 404) {
                                this.$bvToast.toast("Venue not found! Has it been deleted?", {
                                    title: "Error",
                                    autoHideDelay: 3000,
                                });
                            } else if (error.status === 400) {
                                this.$bvToast.toast("Bad form data, please try again with valid changes", {
                                    title: "Error",
                                    autoHideDelay: 3000,
                                });
                            } else {
                                this.$bvToast.toast("Error creating venue: " + error.statusText, {
                                    title: "Error",
                                    autoHideDelay: 3000,
                                });
                            }
                        });
                }
            },

            handleOk(bvModalEvt) {
                bvModalEvt.preventDefault();
                this.handleSubmit();
            },

            checkForm() {
                const valid = this.$refs.editVenueForm.checkValidity();
                if (valid) {
                    Object.keys(this.formState).forEach(v => this.formState[v] = true);
                } else {
                    this.formState.venueName = !!this.venueData.venueName;
                    this.formState.shortDescription = !!this.venueData.shortDescription;
                    this.formState.longDescription = !!this.venueData.longDescription;
                    this.formState.city = !!this.venueData.city;
                    this.formState.address = !!this.venueData.address;
                    this.formState.latitude = (this.venueData.latitude <= 90 && this.venueData.latitude >= -90 && this.venueData.latitude != null);
                    this.formState.longitude = (this.venueData.longitude <= 180 && this.venueData.longitude >= -180 && this.venueData.longitude != null);
                    this.formState.category = !!this.venueData.category.categoryId;
                }

                return valid && this.venueData.category.categoryId != null;
            },

            resetModal() {
                // Object.keys(this.newVenue).forEach(v => this.newVenue[v] = null);
                if (!this.changesMade) {
                    this.venueData = JSON.parse(this.venueDataCopy);
                }
                Object.keys(this.formState).forEach(v => this.formState[v] = null);
            }
        }
    }
</script>

<style scoped>
    #loading {
        margin: auto;
    }

     img {
        margin-left: 1rem;
    }


    h1, h2, h3, h4 {
        margin-top: 0.5rem;
        margin-bottom: 0.75rem;
        margin-left: 1rem;
    }

    h5 {
        margin-left: 0.5rem;
    }

    .image {
        float: left;
        background-size: cover;
        background-repeat: no-repeat;
        background-position: center center;
        border: 1px solid #ebebeb;
        margin: 5px;
    }

    .showMore {
        /*text-decoration: underline !important;*/
        /*border-bottom: 1px solid currentColor;*/
        font-size: small;
    }

    .showMore:hover {
        color: #0000EE !important;
        cursor: pointer;

    }

    #reviewsTable {
        margin-right: 2rem;
        margin-top: 1rem;
    }

    #photos {
        min-width: Calc(100% - 2rem);
    }

    #editButton {
        margin-left: 1rem;
    }
</style>
