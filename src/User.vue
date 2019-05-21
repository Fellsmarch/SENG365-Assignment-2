<template>
    <div>
        <b-container>

                <div class="text-center" v-if="loading">
                    <b-spinner class="align-middle"></b-spinner>
                    <strong>Loading...</strong>
                </div>
                <div v-if="!loading">
                    <b-row align-v="center">
                        <h3><strong>Username:</strong> {{ username }}</h3>
                    </b-row>
                    <b-row align-v="center">
                        <h3><strong>Given Name:</strong> {{ givenName }}</h3>
                    </b-row>
                    <b-row align-v="center">
                        <h3><strong>Family Name:</strong> {{ familyName }}</h3>
                    </b-row>
                    <b-row align-v="center">
                        <h3 v-if="authorised"><strong>Email:</strong> {{ email }}</h3>
                    </b-row>
                    <b-row>
                        <b-button v-if="authorised" v-on:click="editUser" variant="primary">
                            Edit
                        </b-button>
                    </b-row>
                </div>




        </b-container>

        <b-modal id="editUserModal"
                 ref="editUserModal"
                 title="Edit User"
                 size="lg"
                 centered
                 @ok="handleOk"
                 @show="resetModal"
                 @hidden="resetModal">
            <b-container fluid>
                <b-form @submit.stop.prevent="handleSubmit" ref="newUserForm">
                    <b-form-group id="input-group-1">
                        <b-form-input
                            id="input-1"
                            v-model="newGivenName"
                            :state="newGivenName ? true : null"
                            placeholder="Given Name"
                        ></b-form-input>
                    </b-form-group>

                    <b-form-group id="input-group-2">
                        <b-form-input
                            id="input-2"
                            v-model="newFamilyName"
                            :state="newFamilyName ? true : null"
                            placeholder="Family Name"
                        ></b-form-input>
                    </b-form-group>

                    <b-form-group id="input-group-3" invalid-feedback="New passwords must match">
                        <b-form-input
                            type="password"
                            id="input-3"
                            v-model="password"
                            :state="matchPasswords"
                            placeholder="New password"
                        ></b-form-input>
                    </b-form-group>

                    <b-form-group id="input-group-4" invalid-feedback="New passwords must match">
                        <b-form-input
                            type="password"
                            id="input-4"
                            v-model="confirmPassword"
                            :state="matchPasswords"
                            placeholder="Confirm new password"
                        ></b-form-input>
                    </b-form-group>

                    <b-form-group id="input-group-5" invalid-feedback="Must enter current password">
                        <b-form-input
                            type="password"
                            id="input-5"
                            v-model="currentPassword"
                            :state="currentPasswordCheck"
                            placeholder="Current password"
                        ></b-form-input>
                    </b-form-group>
                </b-form>
            </b-container>
        </b-modal>
    </div>
</template>

<script>
    import url from "./url.js";

    export default {
        computed: {
            matchPasswords() {
                if (!this.password && !this.confirmPassword) {
                    return null;
                } else {
                    return this.password === this.confirmPassword;
                }

            },
            currentPasswordCheck() {
                if (!this.password) {
                    return null
                } else {
                    return !!this.currentPassword;
                }
            }
        },
        data() {
            return {
                username: null,
                givenName: null,
                familyName: null,
                email: null,
                authorised: false,
                loading: true,
                password: null,
                confirmPassword: null,
                currentPassword: null,
                newGivenName: null,
                newFamilyName: null,
            }
        },
        mounted: function() {
            this.init();
        },
        methods: {
            init() {
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
                        this.loading = false;
                        this.authorised = !!response.body.email;
                    }, function(error) {
                        this.$bvToast.toast(error.statusText, {
                            title: "Error getting user data",
                            autoHideDelay: 3000,
                        });
                    });
            },

            handleSubmit() {
                if (this.checkForm()) {
                    this.$nextTick(() => {this.$refs.editUserModal.hide()});

                    let config = {
                        headers: {
                            "X-Authorization": this.$cookies.get("user_session")
                        }
                    };

                    let body = {};
                    if (this.newGivenName) {
                        body.givenName = this.newGivenName;
                    }
                    if (this.newFamilyName) {
                        body.familyName = this.newFamilyName;
                    }
                    if (this.password) {
                        body.password = this.password;
                    }

                    this.$http.patch(url + "/users/" + this.$route.params.userId, JSON.stringify(body), config)
                        .then(function (response) {
                            this.$bvToast.toast("Successfully edited details", {
                                title: "Success",
                                autoHideDelay: 3000,
                            });

                            if (body.givenName) {
                                this.givenName = this.newGivenName;
                            }

                            if (body.familyName) {
                                this.familyName = this.newFamilyName;
                            }

                        }, function(error) {
                            if (error.status === 401) {
                                this.$bvToast.toast("You must be logged in to edit your user information!", {
                                    title: "Authentication Missing",
                                    autoHideDelay: 3000,
                                });
                            } else if (error.status === 403) {
                                this.$bvToast.toast("You cannot edit the user information of another user", {
                                    title: "Authentication Error",
                                    autoHideDelay: 3000,
                                });
                            } else {
                                this.$bvToast.toast("Unexpected error: " + error.statusText, {
                                    title: "Unexpected Error",
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
                if (this.newGivenName || this.newFamilyName || this.password) {
                    if (this.password) {
                        return (this.matchPasswords && this.currentPasswordCheck);
                    } else {
                        return true;
                    }
                } else {
                    if (this.currentPassword && !this.confirmPassword) {
                        alert("If you wish to change your password, please enter a new password");
                    }
                    return false
                }
            },

            resetModal() {
                this.newFamilyName = null;
                this.newGivenName = null;
                this.password = null;
                this.confirmPassword = null;
                this.currentPassword = null;
            },

            editUser() {
                this.$nextTick(() => {this.$refs.editUserModal.show()});
            }
        },
        watch: {
            '$route' (to, from) {
                this.loading = true;
                this.init();
            }
        }
    }
</script>

<style scoped>

</style>
