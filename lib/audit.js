export const audit=(sb,user,action,entity,id,detail={})=>sb.from('audit_log').insert({actor:user.id,action,entity,entity_id:String(id??''),detail})
