# EOSIO Claim Rewards 
Claim your rewards on EOSIO Blockchains once per day (or more). Written in Typescript and deployed with Docker.

## How to Setup
The repo already comes with everything you will need to start claiming your rewards. Just bring your own Privatekey and Api Endpoint:

Clone Git Repo:
```
git clone https://github.com/Blacklusion/claim-rewards
```
Move docker-compose and config files out of the repository directory.
```
mv claim-rewards/docker-compose.yml . && cp -r claim-rewards/config . && mv config/example.toml config/local.toml
```
Configure your docker-compose if you wish to change e.g. the name of the container and configure the config/local.toml file before performing docker-compose up:
```
docker-compose up -d
```
You can check if the container is working properly with:
```
docker logs claim-rewards
```
If you see the message "Startup complete", everything is working correctly, and your rewards will be claimed in the specified pattern.

## Security
We **highly** suggest creating a custom permission only for claiming rewards. This ensures that only the claimreward action can be performed with the given Privatekey. You definitely don't want to use your active or even your owner key in this scenario. For added security you could modify the software to support docker secrets.

## Cron
Claim-Rewards uses normal Cron Patterns for specifying the frequency in which the rewards will be claimed. 
![alt text](https://www.framepkg.com/uploads/4/9/7/8/49780617/5870686_orig.jpg "Cron Pattern")


*For example*: If you want to claim your rewards at 12:00 UTC you will need to use the following pattern:
```
00 00 12 * * *
```
Make sure to use '00' before the hour mark, instead of '*'. Otherwise the rewards will be claimed once every second from 12:00 12:59.
