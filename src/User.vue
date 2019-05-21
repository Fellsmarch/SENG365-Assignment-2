<template>
    <b-container>
        <b-row align-v="center">
            <h3>Username: {{ username }}</h3>
        </b-row>
        <b-row align-v="center">
            <h3>Given Name: {{ givenName }}</h3>
        </b-row>
        <b-row align-v="center">
            <h3>Family Name: {{ familyName }}</h3>
        </b-row>
        <b-row align-v="center">
            <h3 v-if="email">Email: {{ email }}</h3>
        </b-row>

    </b-container>
</template>

<script>
    import url from "./url.js";

    export default {
        data() {
            return {
                username: this.$cookies.get("username"),
                givenName: null,
                familyName: null,
                email: null,
            }
        },
        mounted: function() {
            this.$cookies.remove("previous_page");
            let config = {
                headers: {
                    "X-Authorization": this.$cookies.get("user_session")
                }
            };

            if (!this.$cookies.isKey("user_session")) {
                config.headers = null;
            }

            this.$http.get(url + /users/ + this.$route.params.userId, config)
                .then(function(response) {
                    this.username = response.body.username;
                    this.givenName = response.body.givenName;
                    this.familyName = response.body.familyName;
                    this.email = response.body.email ? response.body.email : null;
                }, function(error) {
                    this.$bvToast.toast(error.statusText, {
                        title: "Error getting user data",
                        autoHideDelay: 3000,
                    });
                });
        }
    }
</script>

<style scoped>

</style>
