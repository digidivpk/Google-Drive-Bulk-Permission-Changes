export function generatePermissions(state) {
    let users = state.users.filter((item)=>{
        return (
            !!item['emailAddress'] &&
            !!item['emailAddress'].match(/\S+@\S+\.\S+/) &&
            !!item['role']
        );
    });
    let permissions = state.permissions.map((item, index)=>{
        return {
            ...item,
            index: index+1
        }
    }).filter((item)=>{
        if(item['permission'] === 'domain'){
            return (
                !!item['domain'] &&
                !!item['include'] &&
                !!item['id'] &&
                !!item['role']
            );
        }else if(item['permission'] === 'user'){
            return (
                !!item['include'] &&
                !!item['id']
            );
        }else {
            return (
                !!item['include'] &&
                !!item['permission'] &&
                !!item['id'] &&
                !!item['role']
            );
        }
    }).map((item)=>{
        if(item['permission'] === 'user'){
            return {
                index: item.index,
                include: item.include,
                permission: item.permission,
                fileId: item.id,
                users: users
            };
        }else if(item['permission'] === 'anyone'){
            return {
                index: item.index,
                include: item.include,
                permission: item.permission,
                fileId: item.id,
                role: item.role,
            };
        }else{
            return {
                index: item.index,
                domain: item.domain,
                include: item.include,
                permission: item.permission,
                fileId: item.id,
                role: item.role,
            };
        }
    });

    let permissionsArray = [];
    permissions.forEach((item)=>{
        if(item.permission === 'user'){
            item.users.forEach((user)=>{

                permissionsArray.push({
                    permission: item,
                    resource: {
                        role : user.role,
                        type: item.permission,
                        emailAddress: user.emailAddress,
                        value: user.emailAddress
                    }
                })

            })
        }else if(item.permission === 'domain'){
            permissionsArray.push({
                permission: item,
                resource: {
                    role : item.role,
                    type: item.permission,
                    domain: item.domain,
                    value: item.domain
                }
            })
        }else{
            permissionsArray.push({
                permission: item,
                resource: {
                    role: item.role,
                    type: item.permission
                }
            })
        }
    });

    return permissionsArray
}