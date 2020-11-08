# Ticketing Application
### About
This is ticketing application using microservices to be deployed in kubernetes cluster. This application is built using MERN stack. 

![Architecture](https://i.imgur.com/eQk4fr5.jpeg)


### How to deploy in your local machine
1. Install and run minikube and docker
```
minikube start
sudo service docker start
```

2. Add ingress nginx addon
```
minikube addons enable ingress
```

3. Install ingress nginx using bare-metal yaml file
```
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v0.41.0/deploy/static/provider/baremetal/deploy.yaml
```

4. Set environmental variables inside your kubernetes cluster
```
kubectl create secret generic jwt-secret --from-literal=JWT_KEY=thisissupersecretjwtkey
kubectl create secret generic cookie-secret --from-literal=COOKIE_SIGNING_KEY=thisissupersecretcookiesigningkey
kubectl create secret generic stripe-secret --from-literal=STRIPE_KEY=sk_test_51HjfSGCqMWa1qdglqmD9HYWyp1cvvUC4FoYEXW0mAkV8t8P0Kx26VY4psazschjhZF8juqAvuuaU19Iwwbx4ZKce00hcIwBHNU
```
5. Deploy all services
```
kubectl apply -f infra/k8s/
```
6. Get IP address to access your application
```
kubectl get ingress
```
7. Open your browser and type in the IP address. Enjoy :)
