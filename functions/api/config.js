import {db,reply} from "./_auth.js";
export async function onRequestGet({env}){return reply({authConfigured:Boolean(db(env))})}
