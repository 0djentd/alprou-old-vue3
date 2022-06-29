import axios from "axios";
import { api_url } from "@/config";

export function get_token_str(token) {
  if (token == null || token == "null") {
    return null;
  } else {
    return "Token " + token;
  }
}

export default {
  state: {
    loading: true,
    token: null,
    user: null,
    profile: null,
  },
  mutations: {
    saveToken(state, token) {
      state.token = token;
      localStorage.setItem("token", token);
    },
    saveUser(state, user) {
      state.user = user;
    },
    saveProfile(state, profile) {
      state.profile = profile;
    },
    saveLoading(state, loading) {
      state.loading = loading;
    },
  },
  getters: {
    authenticated(state) {
      const result = Boolean(state.token && state.user && state.profile);
      console.log("Checking authentication, result: " + result);
      return result;
    },
    token_str(state) {
      return get_token_str(state.token);
    },
  },
  actions: {
    async login({ dispatch, commit }, data) {
      let error = null;
      console.log("Trying to login as " + data.username);
      const token = await axios({
        url: api_url + "authtoken/",
        method: "POST",
        data: data,
      })
        .then((response) => response.data.token)
        .catch((err) => {
          error = err;
          console.error(err);
          return null;
        });
      if (token == null) {
        console.error("Login failed");
        console.error(error);
        commit("saveToken", null);
        return;
      }
      dispatch("fetchData", token);
    },
    async relogin({ commit, dispatch }) {
      const token = localStorage.getItem("token");
      if (token != "null" && token != null) {
        dispatch("fetchData", token);
      } else {
        commit("saveLoading", false);
      }
    },
    async logout({ commit }) {
      commit("saveToken", null);
      commit("saveUser", null);
      commit("saveProfile", null);
      localStorage.setItem("token", null);
      window.location.href = "/";
    },
    async fetchData({ commit }, token) {
      commit("saveToken", token);
      commit("saveLoading", true);

      const profile_id = await axios({
        url: api_url + "profiles/get_user_profile_id/",
        method: "GET",
        headers: {
          Authorization: get_token_str(token),
        },
      })
        .then((response) => response.data.pk)
        .catch((error) => console.error(error));

      const profile = await axios({
        url: api_url + "profiles/" + profile_id + "/",
        method: "GET",
        headers: {
          Authorization: get_token_str(token),
        },
      })
        .then((response) => response.data)
        .catch((error) => {
          console.error(error);
        });
      commit("saveProfile", profile);

      const user = await axios({
        url: profile.user,
        method: "GET",
        headers: {
          Authorization: get_token_str(token),
        },
      })
        .then((response) => response.data)
        .catch((error) => {
          console.error(error);
        });
      commit("saveUser", user);
      commit("saveLoading", false);
    },
  },
};
