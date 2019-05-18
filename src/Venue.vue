<template>
    <div>
        <b-container fluid>
            <b-row>
                <!--Venue information and primary photo-->
                <b-col sm="5">
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
                                <h5>{{ meanStarRating }}</h5>
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
                <b-col sm="7">
                    <b-row>
                        <b-card header="Photos" border-variant="primary" header-bg-variant="primary" header-text-variant="white" style="min-width: 50rem">
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
                        <b-card header="Reviews" border-variant="primary" header-bg-variant="primary" header-text-variant="white">
                            <pre>{{ venueData.photos }}</pre>
                        </b-card>
                    </b-row>

                </b-col>
            </b-row>
        </b-container>
    </div>
</template>

<script>
    import url from "./url.js";
    import VueGallery from 'vue-gallery';

    export default {
        computed: {
        },

        data() {
            return {
                imageSize: {width: 200, height: 200},
                defaultImage: require("./assets/default.png"),
                venueData: null,
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
            }
        },

        components: {
            'gallery': VueGallery,
        },

        mounted: function() {
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

                    let dateParts = this.venueData.dateAdded.split("-");
                    let jsDate = new Date(dateParts[0], dateParts[1] -1, dateParts[2].substr(0,2));
                    let dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'};
                    this.formattedDate = jsDate.toLocaleDateString('en-NZ', dateOptions);

                    let queryParameters = {
                        city: this.venueData.city,
                        adminId: this.venueData.admin.userId,
                        q: this.venueData.venueName,
                        categoryId: this.venueData.category.categoryId
                    };

                    this.$http.get(url + "/venues", {params: queryParameters})
                        .then(function(venuesResponse) {
                            let venues = venuesResponse.body;
                            for (let i = 0; i < venues.length; i++) {
                                let venue = venues[i];
                                if (venue.venueId.toString() === this.$route.params.venueId) {

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
                        }, function(venuesError) {
                            alert("Error getting detailed venue information:\n" + venuesError.statusText);
                        });

                    this.loadingComplete = true;

                }, function(error) {
                    alert(error.statusText);
                });
        },

        methods: {
            toggleDetails: function() {
                this.detailsShowing = !this.detailsShowing;
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

</style>
