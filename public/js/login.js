/* eslint-disable*/
import axios from 'axios';
import { showAlert } from './alert';
export const login = async (email, password) => {
  try {
    console.log(email);
    console.log('12345');
    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'http://127.0.0.1:3000/api/v1/users/login', true);
    xhr.withCredentials = true;
    xhr.send(null);
    const res = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:3000/api/v1/users/login',
      data: {
        email,
        password
      }
    });
    console.log(res.data.token);
    if (res.data.status === 'success') {
      showAlert('success', 'oK');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
export const logout = async () => {
  try {
    const res = await axios({
      method: 'Get',
      url: 'http://127.0.0.1:3000/api/v1/users/logout'
    });
    if (res.data.status === 'success') location.reload(true);
  } catch (err) {
    showAlert('error', 'error');
  }
};
