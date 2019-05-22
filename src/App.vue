<template>
    <div id="app">
        <!--Nav bar-->
        <b-navbar toggleable="lg" type="dark" variant="dark" id="navBar">
            <b-navbar-brand :to="{ name: 'home' }">YeetEA</b-navbar-brand>
            <b-navbar-nav>
                <b-nav-item :to="{ name: 'home' }">Home</b-nav-item>
                <b-nav-item :to="{ name: 'venues' }">Venues</b-nav-item>
                <b-nav-item :to="{ name: 'users' }">Users</b-nav-item>
            </b-navbar-nav>
            <b-navbar-nav class="ml-auto">
                <div v-if="isAuth()">
                    <b-nav-item :to="{ name: 'user', params: { userId: this.$cookies.get('user_id') } }">{{ this.username }}</b-nav-item>
                    <!--<a class="nav-link"-->
                       <!--style="cursor: pointer;"-->
                       <!--:to="{ name: 'user', params: { userID: this.$cookies.get('user_id') } }"-->
                    <!--&gt;{{ this.username }}</a>-->
                    <li class="b-nav-item">
                        <a v-on:click="logOut" class="nav-link" style="cursor: pointer;">Logout</a>
                    </li>
                </div>

                <div v-else>
                    <b-nav-item v-on:click="login">Login</b-nav-item>
                    <b-nav-item v-on:click="signUp">Sign Up</b-nav-item>
                </div>
            </b-navbar-nav>
        </b-navbar>

        <!--Display next page-->
        <router-view></router-view>
    </div>
</template>


<script>
    import url from "./url.js";

    export default {
        computed: {
            // isAuth() {
            //     return this.$cookies.isKey('user_session');
            // }
        },
        name: 'app',
        data () {
            return {
                isAuth: function () {
                    // this.username = this.$cookies.get("username");
                    return this.$cookies.isKey("user_session");
                },
                username: this.$cookies.get("username")
            };
        },

        updated: function() {
            this.username = this.$cookies.get("username");
        },

        mounted: function() {
            this.$cookies.remove("previous_page");
        },

        methods: {
            logOut() {
                let config = {
                    headers: {
                        "X-Authorization": this.$cookies.get("user_session")
                    }
                };
                this.$http.post(url + "/users/logout", null, config)
                    .then(function(response) {
                        this.username = "";
                        this.$cookies.remove("user_session");
                        this.$cookies.remove("user_id");
                        this.$cookies.remove("username");
                        // this.$router.push("/");
                    }, function(error) {
                        if (error.status === 401) {
                            this.$cookies.remove("user_session");
                            this.$cookies.remove("user_id");
                            this.$cookies.remove("username");
                            alert("ERROR: You are already logged out!");
                        } else {
                            alert("Error logging out");
                        }
                    });
            },
            login: function() {
                this.$cookies.set("previous_page", this.$router.currentRoute.fullPath);
                this.$router.push("/login");
            },
            signUp: function() {
                this.$cookies.set("previous_page", this.$router.currentRoute.fullPath);
                this.$router.push("/signup");
            },
        },
    }
</script>

<style>
    #app {
      /*font-family: 'Avenir', Helvetica, Arial, sans-serif;*/
       /*-webkit-font-smoothing: antialiased;*/
       /*-moz-osx-font-smoothing: grayscale;*/
      /*text-align: center;*/
      /*color: #2c3e50;*/
      /*margin-top: 60px;*/
    }

    #navBar {
        margin-bottom: 15px;
    }

    h1, h2 {
      font-weight: normal;
    }

    ul {
      list-style-type: none;
      padding: 0;
    }

    li {
      display: inline-block;
      /*margin: 0 10px;*/
    }

    a {
      color: #42b983;
    }

    .reviewBody {
        min-width: 20rem;
    }

    .img-fluid {
        max-height: 480px;
        background-position: 50% 50%;
        background-size: contain;
        object-fit: contain;
    }
</style>
