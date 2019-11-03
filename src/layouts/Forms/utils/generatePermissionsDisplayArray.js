export function generatePermissionsDisplayArray(state=[], data=[]) {
    let newState = state;
    let permission = null
    let index = newState.findIndex((item)=>(item.index === data.permission.permission.index));
    if(data.permission.permission.permission === 'user'){
        permission = `User: ${data.permission.resource.emailAddress} -- Permission: ${data.permission.resource.role}`
    }
    if(data.permission.permission.permission === 'domain'){
        permission = `Domain: ${data.permission.resource.domain} -- Permission: ${data.permission.resource.role}`
    }
    if(data.permission.permission.permission === 'anyone'){
        permission = `Type: ${data.permission.permission.permission} -- Permission: ${data.permission.resource.role}`
    }
    if(index === -1){
        let updatedState = {
            index: data.permission.permission.index,
            include: data.permission.permission.include,
            fileId: data.permission.permission.fileId,
            permissions: [
                permission
            ]
        }
        if(data.hasOwnProperty('error')){
            updatedState['error'] = data.error
        }
        console.log("Data: ",updatedState)
        newState.push(updatedState)
    }else {
        newState[index].permissions.push(permission)
    }
    return newState.sort((a, b) => (a.index > b.index) ? 1 : -1)

}