# Claim Rewards 

Claim rewards on EOSIO Blockchains once per day (or more). Written in Typescript and deployed with Docker.

## How to Setup
The repo already comes with everything you will need to start claiming your rewards. Just execute the commands in the exact same order:
Clone Git Repo:
```
git clone https://github.com/Blacklusion/claim-rewards
```
Move Files you will need to configure for better access
```
mv claim-rewards/docker-compose.yml . && cp -r claim-rewards/config . && mv config/example.toml config/local.toml
```
IMPORTANT: Configure your docker-compose if you wish to change e.g. the name of the container and configure the config/local.toml before performing docker-compose up
```
docker-compose up -d
```
You can check if the container is working properly with:
```
docker logs claim-rewards
```