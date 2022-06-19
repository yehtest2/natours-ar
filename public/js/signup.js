/* eslint-disable*/
import axios from 'axios';
export const Signup = async (name, email, role, password, passwordConfirm) => {
  const res = await axios({
    method: 'POST',
    url: '/api/v1/users/signup',
    data: {
      name,
      email,
      role,
      password,
      passwordConfirm
    }
  });
  console.log(res);
  if (res.status === 200) {
    location.assign('/');
  }
};
