import {db,reply,currentUser} from "../_auth.js";
export async function onRequestGet({request,env}){if(!db(env))return reply({error:"JT_AUTH_DB is not configured."},503);const user=await currentUser(request,env);return reply({authenticated:Boolean(user),user:user||null})}
