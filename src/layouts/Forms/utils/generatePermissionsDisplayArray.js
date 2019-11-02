export function generatePermissionsDisplayArray(state=[], data=[]) {
    let newState = state;
    let permission = null
    let index = newState.findIndex((item)=>(item.index === data.permission.index));
    if(data.permission.permission === 'user'){
        permission = `User: ${data.resource.emailAddress} -- Permission: ${data.resource.role}`
    }
    if(data.permission.permission === 'domain'){
        permission = `Domain: ${data.resource.domain} -- Permission: ${data.resource.role}`
    }
    if(data.permission.permission === 'anyone'){
        permission = `Type: ${data.permission.permission} -- Permission: ${data.resource.role}`
    }
    if(index === -1){
        newState.push({
            index: data.permission.index,
            include: data.permission.include,
            fileId: data.permission.fileId,
            permissions: [
                permission
            ],
        })
    }else {
        newState[index].permissions.push(permission)
    }
    return newState.sort((a, b) => (a.index > b.index) ? 1 : -1)

}