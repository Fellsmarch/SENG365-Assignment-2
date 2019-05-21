import Vue from 'vue';
import App from './App.vue';
import Home from "./Home.vue";
import Venues from "./Venues.vue";
import SignUp from "./SignUp.vue";
import Login from "./Login.vue";
import Venue from "./Venue.vue";
import User from "./User.vue";
import Users from "./Users.vue";

import VueRouter from 'vue-router';
import VueResource from 'vue-resource';
import BootstrapVue from 'bootstrap-vue';
import VueCookies from 'vue-cookies';
import StarRating from 'vue-star-rating';
import VueGallery from 'vue-gallery';
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

Vue.use(VueRouter);
Vue.use(VueResource);
Vue.use(BootstrapVue);
Vue.use(VueCookies);
Vue.component('star-rating', StarRating);
Vue.component('gallery', VueGallery);

Vue.http.options.emulateJSON = true;

const routes = [
    {
        path: "/",
        name: "home",
        component: Home
    },

    {
        path: "/venues",
        name: "venues",
        component: Venues
    },

    {
        path: "/venues/:venueId",
        name: "venue",
        component: Venue
    },

    {
        path: "/signup",
        name: "signup",
        component: SignUp
    },

    {
        path: "/login",
        name: "login",
        component: Login
    },

    {
        path: "/user/:userId",
        name: "user",
        component: User
    },

    {
        path: "/users",
        name: "users",
        component: Users
    },

    {
        path: "*",
        redirect: "/"
    }
];

const router = new VueRouter({
    routes: routes,
    mode: "history"
});

new Vue({
    el: '#app',
    router: router,
    render: h => h(App)
});
