<template>
    <div>
        <b-container fluid>
            <b-row>
                <!--Venue information and primary photo-->
                <b-col sm="4">
                    <b-alert show variant="danger">Venue Info</b-alert>
                    <div id="loading" class="text-center" v-if="!loadingComplete">
                        <b-spinner class="align-middle "></b-spinner>
                        <strong>Loading...</strong>
                    </div>

                    <b-row>
                        <div v-if="photoUrl">
                            <b-img  :src="photoUrl" fluid v-bind="imageSize"></b-img>
                        </div>
                        <div v-else>
                            <b-img :src="defaultImage" fluid v-bind="imageSize"></b-img>
                        </div>

                        <div id="venueTitles" v-if="loadingComplete">
                            <h1>{{ venueData.venueName }}</h1>
                            <h3>{{ venueData.category.categoryName }}</h3>
                            <h4>{{ venueData.shortDescription }}</h4>
                        </div>
                    </b-row>


                    <b-card class="mt-3" header="Form Data Result">
                        <pre class="m-0">{{ venueData }}</pre>
                    </b-card>
                </b-col>

                <!--Venue photos and reviews-->
                <b-col sm="8">
                    <b-alert show>Default Alert</b-alert>
                </b-col>
            </b-row>
        </b-container>
    </div>
</template>

<script>
    import url from "./url.js";
    // defaultPhoto = require("./assest/default.png");

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
                photoUrl: null,
            }
        },

        mounted: function() {
            this.$http.get(url + "/venues/" + this.$route.params.venueId)
                .then(function(response) {
                    this.venueData = response.body;

                    for (let i = 0; i < this.venueData.photos.length; i++) {
                        let photo = this.venueData.photos[i];

                        if (photo.isPrimary) {
                            this.primaryPhoto = photo;
                            this.photoUrl = url + "/venues/" + this.$route.params.venueId + "/photos/" + this.primaryPhoto.photoFilename;
                        }
                    }

                    if (!this.primaryPhoto) {
                        // this.photoUrl = "./assets/default.png";
                        // this.photoUrl = this.defaultPhoto;
                    }



                    this.loadingComplete = true;

                }, function(error) {
                    alert(error.statusText);
                });
        },

        methods: {
        }
    }
</script>

<style>
    #loading {
        margin: auto;
    }

    #venueTitles {
        margin-left: 1rem;
    }

    img {
        margin-left: 1rem;
    }

    h1, h2, h3, h4, h5 {
        margin-top: 0.5rem;
        margin-bottom: 0.75rem;
    }
</style>
