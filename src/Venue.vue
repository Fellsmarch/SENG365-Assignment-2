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
                            <b-img :src="defaultImage" fluid v-bind="imageSize"></b-img>
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
                defaultImage: require("./assets/default.png"),
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
                    // reviewDetails: {
                    //     label: "Review Details",
                    //     sortable: false
                    // },
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
            }
        },

        mounted: function() {
            this.$cookies.remove("previous_page");
            this.$http.get(url + "/venues/" + this.$route.params.venueId)
                .then(function(response) {
                    this.venueData = response.body;

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

                    console.log(this.venueData);
                    // let dateParts = this.venueData.dateAdded.split("-");
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

        methods: {
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

                            // let dateParts = review.timePosted.split("-");
                            // let jsDate = new Date(dateParts[0], dateParts[1] -1, dateParts[2].substr(0,2));
                            // let dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'};
                            // let dateTime = jsDate.toLocaleTimeString('en-NZ', dateOptions);

                            let jsDate = new Date(review.timePosted);

                            this.reviews.push({
                                username: review.reviewAuthor.username,
                                reviewBody: review.reviewBody,
                                starRating: review.starRating,
                                costRating: review.costRating,
                                dateTime: jsDate
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
    }

    #photos {
        min-width: Calc(100% - 2rem);
    }
</style>
