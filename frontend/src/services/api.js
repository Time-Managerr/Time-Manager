import axios from "axios";

export const api = axios.create({
  baseURL: "api/",
  headers: {'X-Custom-Header': 'foobar'}
});
