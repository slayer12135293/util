const Util = {

    getUuid() {
        return Date.now()
    },

    capitalize(string) {
        return string.charAt(0).toUpperCase() + string.slice(1)
    },

    validateEmail(email) {
        // eslint-disable-next-line max-len
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        return re.test(email)
    },

    sortArrayByProperty(property, isDesc) {
        let sortOrder = 1
        if (property[0] === '-') {
            sortOrder = -1
            property = property.substr(1)
        }
        return function (a, b) {
            let result
            if (isDesc === 'desc') {
                result = (a[property] > b[property]) ? -1 : (a[property] < b[property]) ? 1 : 0
            } else {
                result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0
            }
            return result * sortOrder
        }
    },

    groupBy(list, keyGetter) {
        const map = new Map()
        list.forEach((item) => {
            const key = keyGetter(item)
            if (!map.has(key)) {
                map.set(key, [ item ])
            } else {
                map.get(key).push(item)
            }
        })
        return map
    }
   
}

export default Util
