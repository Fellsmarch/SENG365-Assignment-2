<template>
    <div>
        <b-container>
                <div class="text-center" v-if="loading">
                    <b-spinner class="align-middle"></b-spinner>
                    <strong>Loading...</strong>
                </div>
                <div v-if="!loading">
                    <div style="width: 100%;">
                        <div>
                            <b-img class="imgClass" :src="userImage" onerror="this.src='/src/assets/default.png'" fluid v-bind="imageSize"></b-img>
                        </div>
                        <!--<div v-if="userImage">-->
                            <!--<b-img class="imgClass" :src="url + '/users/' + this.$route.params.userId + '/photo'" fluid></b-img>-->
                        <!--</div>-->
                        <!--<div v-else>-->
                            <!--<b-img class="imgClass" src="/src/assets/default.png" fluid></b-img>-->
                        <!--</div>-->
                    </div>
                    <div style="width: 100%; text-align: center;">
                        <b-button v-if="authorised" v-on:click="showUploadModal" variant="primary">Upload Photo</b-button>
                        <b-button v-if="authorised" v-on:click="deletePhoto" variant="danger">Delete Photo</b-button>
                    </div>
                    <h3><strong>Username:</strong> {{ username }}</h3>
                    <h3><strong>Given Name:</strong> {{ givenName }}</h3>
                    <h3><strong>Family Name:</strong> {{ familyName }}</h3>
                    <h3 v-if="authorised"><strong>Email:</strong> {{ email }}</h3>
                    <div style="width: 100%; text-align:center;">
                        <b-button v-if="authorised" v-on:click="editUser" variant="primary">Edit Profile</b-button>
                    </div>
                </div>
        </b-container>

        <b-modal id="uploadPhotoModal"
                 ref="uploadPhotoModal"
                 title="Upload Photo"
                 size="lg"
                 centered>

            <b-form-file v-model="newPhoto"
                         :state="newPhoto ? true : null"
                         placeholder="Choose an image..."
                         drop-placeholder="Drop image here..."
                         v-on:change="selectFileErrorPresent = false"
                         accept="image/jpeg, image/png, image/jpg">
            </b-form-file>

            <template slot="modal-footer">
                <div v-if="selectFileErrorPresent" class="text-danger">
                    {{ selectFileError }}
                </div>
                <b-button v-on:click="closeUploadModal">Cancel</b-button>
                <b-button variant="primary" v-on:click="uploadPhoto">Upload</b-button>
            </template>
        </b-modal>

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
                userImage: null,
                imageSize: {width: 200, height: 200},
                newPhoto: null,
                selectFileError: "",
                selectFileErrorPresent: false,
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

                this.$http.get(url + "/users/" + this.$route.params.userId, config)
                    .then(function(response) {
                        this.username = response.body.username;
                        this.givenName = response.body.givenName;
                        this.familyName = response.body.familyName;
                        this.email = response.body.email ? response.body.email : null;
                        this.authorised = !!response.body.email;
                        this.userImage = url + "/users/" + this.$route.params.userId + "/photo";

                        this.loading = false;
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
            },
            showUploadModal() {
                this.$nextTick(() => {this.$refs.uploadPhotoModal.show()});
            },
            closeUploadModal() {
                this.$nextTick(() => {this.$refs.uploadPhotoModal.hide()});
            },
            uploadPhoto() {
                if (this.newPhoto) {
                    if (this.newPhoto.size <= 20000000) {
                        let config = {
                            emulateJSON: false,
                            headers: {
                                "X-Authorization": this.$cookies.get("user_session"),
                                "Content-Type": this.newPhoto.type
                            },
                        };

                        this.loading = true;

                        this.$http.put(url + "/users/" + this.$route.params.userId + "/photo", this.newPhoto, config)
                            .then(function(response) {
                                if (response.status === 200) {
                                    this.$bvToast.toast("Photo successfully changed", {
                                        title: "Success",
                                        autoHideDelay: 3000,
                                    });
                                } else if (response.status === 201) {
                                    this.$bvToast.toast("Photo successfully created", {
                                        title: "Success",
                                        autoHideDelay: 3000,
                                    });
                                }

                                this.init();
                                this.closeUploadModal();
                            }, function(error) {
                                this.closeUploadModal();
                                if (error.status === 400) {
                                    this.$bvToast.toast("Bad photo information, please try again with another photo!", {
                                        title: "Bad photo information",
                                        autoHideDelay: 3000,
                                    });
                                } else if (error.status === 401) {
                                    this.$bvToast.toast("You must be logged in to upload a new photo!", {
                                        title: "Authentication Missing",
                                        autoHideDelay: 3000,
                                    });
                                } else if (error.status === 403) {
                                    this.$bvToast.toast("You cannot upload a photo for another user", {
                                        title: "Authentication Error",
                                        autoHideDelay: 3000,
                                    });
                                } else if (error.status === 404) {
                                    this.$bvToast.toast("User not found!", {
                                        title: "Not found error",
                                        autoHideDelay: 3000,
                                    });
                                } else {
                                    this.$bvToast.toast("Unexpected error: " + error.statusText, {
                                        title: "Unexpected Error",
                                        autoHideDelay: 3000,
                                    });
                                }
                            });
                    } else {
                        this.selectFileErrorPresent = true;
                        this.selectFileError = "The file is too large!";
                    }
                } else {
                    this.selectFileErrorPresent = true;
                    this.selectFileError = "Please choose a file to upload!";
                }
            },
            deletePhoto() {
                let config = {
                    headers: {
                        "X-Authorization": this.$cookies.get("user_session"),
                    },
                };

                this.$http.delete(url + "/users/" + this.$route.params.userId + "/photo", config)
                    .then(function(response) {
                    this.$bvToast.toast("Photo successfully deleted", {
                        title: "Success",
                        autoHideDelay: 3000,
                    });

                    this.userImage = null;
                    this.init();
                    this.closeUploadModal();
                    }, function(error) {
                        this.closeUploadModal();
                        if (error.status === 401) {
                            this.$bvToast.toast("You must be logged in to upload a new photo!", {
                                title: "Authentication Missing",
                                autoHideDelay: 3000,
                            });
                        } else if (error.status === 403) {
                            this.$bvToast.toast("You cannot upload a photo for another user", {
                                title: "Authentication Error",
                                autoHideDelay: 3000,
                            });
                        } else if (error.status === 404) {
                            this.$bvToast.toast("User not found!", {
                                title: "Not found error",
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
        watch: {
            '$route' (to, from) {
                this.loading = true;
                this.init();
            }
        }
    }
</script>

<style scoped>
    h3 {
        text-align: center;
    }

    #editButton {
        width: 5rem;
        margin-left: Calc(50% - 2.5rem);
    }

    .imgClass {
        margin-left: Calc(50% - 100px);
    }
</style>
