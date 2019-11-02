export function readCsvFile(file) {
    return new Promise((resolve, reject)=>{
        var reader = new FileReader();
        reader.onload = function(event) {
            let result = event.target.result.split('\n')
            let headers = result[0].split(',')
            result.splice(0, 1)
            let data = result.filter(item=>!!item).map((item)=>{
                let row = item.split(',')
                let obj = Object()
                headers.forEach((header, index)=>{
                    obj[header.trim()] = (row[index].trim() === 'null'? '': row[index].trim())
                })
                return obj
            })
            resolve(data)
        };
        reader.onerror = function(event) {
            reject(event.target.error)
        };
        reader.readAsText(file);
    })
}