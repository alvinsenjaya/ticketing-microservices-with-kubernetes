import axios from 'axios';

const buildClient = ({ req }) => {
  if(typeof window === 'undefined') {
    return axios.create({
      baseURL: 'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local',
      headers: req.headers,
      withCredentials: true, 
      credentials: 'include'
    });
  } else {
    return axios.create({
      baseURL: '/',
      withCredentials: true, 
      credentials: 'include'
    })
  }
}

export default buildClient;