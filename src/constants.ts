//@ts-ignore
export enum EnvironmentEnum {
  "PROD"="PRODUCTION",
  "DEV"="DEVELOPMENT"
}

let environment = EnvironmentEnum.DEV

if(import.meta.env.DEV){
  environment = EnvironmentEnum.DEV
}
else if(import.meta.env.PROD){
  environment = EnvironmentEnum.PROD
}

let BACKEND_BASE_URL = "http://localhost:8081/api"
let WS_BASE_URL = "wss://ws.onlyfunds.in"

if( environment === EnvironmentEnum.PROD ){
  BACKEND_BASE_URL = "https://api.onlyfunds.in/api"
  WS_BASE_URL = "wss://ws.onlyfunds.in"
}

export {
  environment,
  BACKEND_BASE_URL,
  WS_BASE_URL
}

