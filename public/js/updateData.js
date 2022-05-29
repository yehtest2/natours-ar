/* eslint-disable*/
import axios from 'axios';
export const updateSettings = async (data, type) => {
  console.log('12345678');
  console.log(email);
  const url =
    type === 'password'
      ? '/api/v1/users/updateMypassword'
      : '/api/v1/users/updateMe';
  const res = await axios({
    method: 'PATCH',
    url,
    data
  });
  console.log(res);
  if (res.data.status === 'success') {
    window.setTimeout(() => {
      location.assign('/me');
    }, 1500);
  }
};
