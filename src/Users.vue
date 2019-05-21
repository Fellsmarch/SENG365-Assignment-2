<template>
    <b-container>
        <b-form @submit="onSubmit">
            <b-form-group id="input-group-1"
                          label-for="input-1"
                          label="Please enter the user ID of the user you'd like to view"
                          invalid-feedback="User with that ID not found">
                <b-form-input
                    id="input-1"
                    v-model="userId"
                    required
                    type="number"
                    placeholder="User Id"
                    :state="userFound"
                    v-on:change="userFound = null"
                ></b-form-input>
            </b-form-group>
            <b-button type="submit" variant="primary">Submit</b-button>
        </b-form>
    </b-container>
</template>

<script>
    import url from "./url.js";

    export default {
        data() {
            return {
                userId: null,
                userFound: null
            }
        },
        methods: {
            onSubmit(event) {
                event.preventDefault();
                this.$http.get(url + "/users/" + this.userId)
                    .then(function(response) {
                        this.userFound = true;
                        this.$router.push("/user/" + this.userId);
                    }, function(error) {
                        this.userFound = false;
                    });
            }
        }
    }
</script>
