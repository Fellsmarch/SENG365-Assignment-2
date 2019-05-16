exports.setCookies = function(token, user_id, username) {
    this.$cookies.set("user_session", token);
    this.$cookies.set("user_id", user_id);
    this.$cookies.set("username", username);
};

exports.getCookies = function() {
    return {
        token: this.$cookies.get("user_session"),
        user_id: this.$cookies.get("user_id"),
        username: this.$cookies.get("username")
    }
};

exports.loggedIn = function() {
    return this.$cookies.isKey("user_session");
};

exports.removeCookies = function() {
    this.$cookies.remove("user_session");
    this.$cookies.remove("user_id");
    this.$cookies.remove("username");
};

exports.getName = function() {
    return this.$cookies.get("username");
};
