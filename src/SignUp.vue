<template>
    <div id="signup">
        <b-form @submit="onSubmit" v-if="show">
            <!--Username input -- String, minimum length: 1, required-->
            <b-form-group id="input-group-1" label-for="input-1">
                <b-form-input
                    id="input-1"
                    v-model="form.username"
                    required
                    placeholder="Username"
                    maxlength="64"
                ></b-form-input>
            </b-form-group>

            <!--Email input -- String, minimum length: 1, matches email, required-->
            <b-form-group id="input-group-2" label-for="input-2">
                <b-form-input
                    type="email"
                    id="input-2"
                    v-model="form.email"
                    required
                    placeholder="Email"
                ></b-form-input>
            </b-form-group>

            <!--Given Name input -- String, minimum length: 1, required-->
            <b-form-group id="input-group-3" label-for="input-3">
                <b-form-input
                    id="input-3"
                    v-model="form.givenName"
                    required
                    placeholder="Given name"
                ></b-form-input>
            </b-form-group>

            <!--Family Name input -- String, minimum length: 1, required-->
            <b-form-group id="input-group-4" label-for="input-4">
                <b-form-input
                    id="input-4"
                    v-model="form.familyName"
                    required
                    placeholder="Family name"
                ></b-form-input>
            </b-form-group>

            <!--Password input -- String, minimum length: 1, required-->
            <b-form-group id="input-group-5" label-for="input-5">
                <b-form-input
                    type="password"
                    id="input-5"
                    v-model="form.password"
                    :state="matchPasswords"
                    aria-describedby="confirm-password-feedback"
                    required
                    placeholder="Password"
                ></b-form-input>

                <b-form-invalid-feedback id="password-feedback">
                    Passwords must match
                </b-form-invalid-feedback>
            </b-form-group>
            <b-form-group id="input-group-6" label-for="input-6">
                <b-form-input
                    type="password"
                    id="input-6"
                    v-model="confirmPassword"
                    :state="matchPasswords"
                    aria-describedby="confirm-password-feedback"
                    required
                    placeholder="Confirm password"
                ></b-form-input>

                <b-form-invalid-feedback id="confirm-password-feedback">
                    Passwords must match
                </b-form-invalid-feedback>
            </b-form-group>

            <b-button type="submit" variant="primary">Sign Up</b-button>
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
            matchPasswords() {
                if (!this.form.password && !this.confirmPassword) {
                    return null;
                } else {
                    return this.form.password === this.confirmPassword;
                }

            }
        },
        data() {
            return {
                form: {
                    username: "",
                    email: "",
                    givenName: "",
                    familyName: "",
                    password: "",
                },
                show: true,
                confirmPassword: "",
                userId: null
            }
        },
        methods: {
            onSubmit(event) {
                event.preventDefault();
                if (this.matchPasswords) {
                    this.$http.post(url + "/users", JSON.stringify(this.form)) //Send create user POST
                        .then(function(response) {
                            this.userId = response.body.userId;

                            let loginInfo = {
                                username: this.form.username,
                                email: this.form.email,
                                password: this.form.password
                            };

                            this.$http.post(url + "/users/login", JSON.stringify(loginInfo)) //Send login POST
                                .then(function(loginResponse) {
                                    this.$cookies.set("username", loginInfo.username);
                                    this.$cookies.set("user_session", loginResponse.body.token);
                                    this.$cookies.set("user_id", loginResponse.body.userId);
                                    this.$router.push({ name: "home" });
                                }, function(loginError) {
                                    alert(loginError.statusText);
                                });
                        }, function(error) {
                            alert(error.statusText);
                        });
                }
            },
        }
    }
</script>

<style scoped>
    #signup {
        margin-top:30px;
        margin-right:30px;
        margin-left:30px;
    }

    /*input {*/
        /*margin-top:30px;*/
        /*margin-bottom:30px;*/
    /*}*/
</style>
