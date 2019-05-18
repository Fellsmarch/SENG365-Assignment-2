<template>
    <div id="login">
        <b-form @submit="onSubmit">
            <!--Username input -- String, minimum length: 1, required-->
            <b-form-group id="input-group-1">
                <b-form-input
                    id="input-1"
                    v-model="form.username"
                    placeholder="Username"
                    :state="usernameCheck"
                    aria-describedby="username-or-email"
                    maxlength="64"
                ></b-form-input>

            </b-form-group>

            <!--Email input -- String, minimum length: 1, matches email, required-->

            <b-form-group id="input-group-2">
                <b-form-input
                    type="email"
                    id="input-2"
                    v-model="form.email"
                    placeholder="Email"
                    :state="emailCheck"
                    aria-describedby="username-or-email"
                ></b-form-input>
                <b-form-invalid-feedback id="username-or-email">
                    Please only enter your username or your email
                </b-form-invalid-feedback>
            </b-form-group>


            <!--Password input -- String, minimum length: 1, required-->
            <b-form-group id="input-group-3">
                <b-form-input
                    type="password"
                    id="input-3"
                    v-model="form.password"
                    required
                    placeholder="Password"
                ></b-form-input>
            </b-form-group>

            <b-button type="submit" variant="primary">Login</b-button>
            <b-button v-on:click="signUp">Sign Up</b-button>
        </b-form>

        <!--<b-card class="mt-3" header="Form Data Result">-->
            <!--<pre class="m-0">{{ form }}</pre>-->
        <!--</b-card>-->

    </div>
</template>

<script>
    import url from "./url.js";

    export default {
        computed: {
            usernameCheck() {
                if (this.form.username) {
                    return !this.form.email;
                } else {
                    return null;
                }

            },
            emailCheck() {
                if (this.form.email) {
                    return !this.form.username;
                } else {
                    return null;
                }

            }
        },
        data() {
            return {
                form: {
                    username: "",
                    email: "",
                    password: "",
                },
            }
        },
        mounted: function() {
            if (this.$cookies.get("user_session")) {
                this.$router.push("/");
            }
        },
        methods: {
            onSubmit(event) {
                event.preventDefault();
                if (this.usernameCheck || this.emailCheck) {
                    this.$http.post(url + "/users/login", JSON.stringify(this.form)) //Send login POST
                        .then(function(response) {
                            if (this.form.username) {
                                this.$cookies.set("username", this.form.username);
                            } else {
                                this.$http.get(url + "/users/" + response.body.userId)
                                    .then(function(userResponse) {
                                        this.$cookies.set("username", userResponse.body.username);
                                    }, function(userError) {
                                        alert("Error logging in: " + userError.statusText);
                                    });
                            }
                            this.$cookies.set("user_session", response.body.token);
                            this.$cookies.set("user_id", response.body.userId);

                            if (this.$cookies.isKey("previous_page")) {
                                let previousPage = this.$cookies.get("previous_page");
                                this.$cookies.remove("previous_page");
                                this.$router.push(previousPage);
                            } else {
                                this.$router.push("/");
                            }
                        }, function(error) {
                            alert(error.statusText);
                        });
                } else {
                    if (this.usernameCheck == null && this.emailCheck == null) {
                        alert("Please enter either a username or email");
                    }
                }
            },

            signUp: function () {
                this.$router.push("/signup");
            }
        }
    }
</script>

<style scoped>
    #login {
        margin-top:30px;
        margin-right:30px;
        margin-left:30px;
    }
</style>
