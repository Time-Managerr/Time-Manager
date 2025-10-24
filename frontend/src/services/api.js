import axios from "axios";

export const api = axios.create({
  baseURL: "http://127.0.0.1:3000/",
  headers: {'X-Custom-Header': 'foobar'}
});
