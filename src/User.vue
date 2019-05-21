<template>
    <b-container class="align-middle">
        <b-row align-v="center">
            <label class="title">Username:</label>
            <label class="info">{{ username }}</label>
        </b-row>

    </b-container>
</template>

<script>
    import url from "./url.js";

    export default {
        data() {
            return {
                username: this.$cookies.get("username"),
            }
        }
    }
</script>

<style scoped>
    .title {
        font-size: 1.75rem; /*h3*/
    }

    .info {
        font-size: 1.25rem;
    }

</style>
