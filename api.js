import { Alert } from 'react-native'
import config from 'src/config'
import Store from 'src/app/store'
import i18n from '../i18n/index'
import { logOut, saveToken } from 'src/login/reducer'
import { logOut as logOutNavigate } from 'src/app/navigation-reducer'
import * as dateFns from 'date-fns'
import PeriodUtil from './period'
import AuthTokenUtil from './auth-token'

const BASE_URL = config.apiUrl

let isShowingAlert = false

const Api = {

    /**
     * Available endpoints
     */
    ENDPOINTS: {
        login: '/authentication/user/token',
        refreshToken: '/authentication/user/token/refresh',

        account: {
            averages: (companyId, accountType, fromPeriod, toPeriod, fromAccount, toAccount, ) => `/account/averageaggregates/${companyId}/${fromPeriod}/${toPeriod}/${fromAccount}/${toAccount}?accountType=${accountType}&sortType=accountLevel4`,
            aggregates: (companyId, accountType, fromDate, toDate, fromAccount = '', toAccount = '') => `/account/aggregates/${companyId}/${fromDate}/${toDate}/${accountType}/${fromAccount}/${toAccount}`,
            accumulatedAggregates: (companyId, accountType, fromPeriod, toPeriod, fromAccount = '', toAccount = '') => `/account/accumulatedaggregates/${companyId}/${accountType}/${fromPeriod}/${toPeriod}/${fromAccount}/${toAccount}`,
            temp: (companyId, accountType, fromPeriod, toPeriod, fromAccount, toAccount) => `/account/aggregates/${companyId}/${fromPeriod}/${toPeriod}/${fromAccount}/${toAccount}?accountType=${accountType}&sortType=accountLevel4`,
        },

        createGoal: '/goal',
        customers: (orgId, fromDate, toDate) => `/invoice/customers?organizationId=${orgId}&fromPeriod=${fromDate}&toPeriod=${toDate}`,
        customerInvoices: (orgId, invoiceHolderId, fromDate, toDate) => `/invoice/invoiceholder?organizationId=${orgId}&id=${invoiceHolderId}&type=Invoice&fromPeriod=${fromDate}&toPeriod=${toDate}&nonePaidOnly=false`,
        companies: '/companies',
        activities: companyId => `/activity?companyId=${companyId}`,
        myGoals: companyId => `/goal/${companyId}`,
        deleteGoal: (id) => `/goal/${id}`,
        invoices: (orgId, fromDate, toDate) => `/invoice/allinvoices?organizationId=${orgId}&fromPeriod=${fromDate}&toPeriod=${toDate}`,
        myMoney: (companyId, period) => `/account/mymoney/${companyId}/${period}`,

        register: `/authentication`,
        users: `/aspnetusers`,
        me: `/aspnetusers/userinfo`,
        demoCompany: `/companies/democompany`,

        user: (id) => `/aspnetusers/${id}`,
        updatePassword: (id) => `/aspnetusers/passwd/${id}`,
        getAllUsers: `/aspnetusers`,
        inviteUser: `/aspnetusers/`,

        company: {
            schedulingDay: companyId => `/companysettings/schedulingday/${companyId}`,
            updateCompanyInfo: companyId => `/companies/${companyId}`,
            archive: companyId => `/companies/archive/${companyId}`,
            getConfigurations: (companyId) => `/configuration/${companyId}/`,
            deleteConfiguration: `/configuration/`,
            vat: companyId => `/companysettings/vatsettings/${companyId}`,
        },

        notification: {
            unseenCount: userId => `/notification/${userId}/unseencount`,
            unreadCount: userId => `/notification/${userId}/unreadcount`,
            markAllAsSeen: userId => `/notification/${userId}/updateallnotifications`,
            markAsRead: (userId, notificationId) => `/notification/${userId}/updateread/${notificationId}`,
        },

        notifications: (userId, pageSize = 100) => `/notification/${userId}?take=${pageSize}`,

        /**
         *  ExtractorConfigurations
         */
        createExtractorConfiguration: (userId) => `/configuration?userId=${userId}`,

        /**
       *  Telemetry
       */
        logEvent: `/telemetry/event`,

    },

    /**
     * @param path should be one of {@link Api.ENDPOINTS}
     * @returns {Promise<Response>}
     */
    async get(path, autologout = true) {
        return _request(path, 'GET', null, autologout)
    },

    async post(path, payload, autoLogout = true) {
        return _request(path, 'POST', payload, autoLogout)
    },

    async put(path, payload, autoLogout = true) {
        return _request(path, 'PUT', payload, autoLogout)
    },

    async patch(path, payload, autoLogout = true) {
        return _request(path, 'PATCH', payload, autoLogout)
    },

    async delete(path, payload, autoLogout = true) {
        return _request(path, 'DELETE', payload, autoLogout)
    },

    async fetchAggregate(type, fromDate, toDate, companyId, fromAccount, toAccount) {
        fromDate = dateFns.format(fromDate, 'YYYY-MM-DD')
        toDate = dateFns.format(toDate, 'YYYY-MM-DD')
        companyId = companyId || Store.getState().user.currentCompanyId

        const aggregate = await Api.get(Api.ENDPOINTS.account.aggregates(
            companyId,
            type,
            fromDate,
            toDate,
            fromAccount,
            toAccount,
        ))

        return {
            aggregate: PeriodUtil.padAggregates(
                Object.entries(aggregate).map(([ period, value ]) => ({ period, ...value })),
                fromDate,
                toDate,
            ),
            fromDate,
            toDate,
        }
    },

    async fetchAccumulatedValues(type, fromDate, toDate, companyId, fromAccount, toAccount) {
        fromDate = dateFns.format(fromDate, 'YYYY-MM-DD')
        toDate = dateFns.format(toDate, 'YYYY-MM-DD')
        companyId = companyId || Store.getState().user.currentCompanyId

        const values = await Api.get(Api.ENDPOINTS.account.accumulatedAggregates(
            companyId,
            type,
            fromDate,
            toDate,
            fromAccount,
            toAccount,
        ))

        return Object.entries(values).map(([ period, payload ]) => ({
            period,
            sum: payload.transactionSum,
        }))
    },

    async fetchAccounts(fromAccount, toAccount, fromPeriod, toPeriod, accountType, companyId) {
        companyId = companyId || Store.getState().user.currentCompanyId

        //add `?sortType=accountLevel4` when no longer using temp
        const accounts = await Api.get(
            `${Api.ENDPOINTS.account.temp(
                companyId,
                accountType,
                dateFns.format(fromPeriod, 'YYYY-MM-DD'),
                dateFns.format(toPeriod, 'YYYY-MM-DD'),
                fromAccount,
                toAccount,
            )}`,
        )

        const averages = await Api.get(
            Api.ENDPOINTS.account.averages(
                companyId,
                accountType,
                dateFns.format(dateFns.subYears(fromPeriod, 1), 'YYYY-MM-DD'),
                dateFns.format(toPeriod, 'YYYY-MM-DD'),
                fromAccount,
                toAccount,
            ),
        )

        const accountConvert = Object.entries(accounts)
        const averageConvert = Object.entries(averages)

        return accountConvert.map(([ , account ]) => {
            const [ , averageObj ] = averageConvert
                .find(([ , average ]) => average.account === account.account)

            const transactionSumAverage = averageObj ? averageObj.transactionSum : 0

            return {
                ...account,
                transactionSumAverage,
            }
        })
    },

    async companyHasExtractor(companyId) {
        try {
            const extractors = await Api.get(Api.ENDPOINTS.company.getConfigurations(companyId))
            return extractors.length > 0
        } catch (error) {
            console.warn(error)
        }
    },
}

export const updateToken = async (refreshToken) => {
    try {
        const refreshTokenParams = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: `{"refreshToken":"${refreshToken}"}`,
        }
        const refreshUrl = `${BASE_URL}${Api.ENDPOINTS.refreshToken}`

        console.log(`[updateToken] Updating token with: %c${refreshUrl}%c`, 'color: blue', 'color: black', refreshTokenParams)
        const refreshTokenResponse = await fetch(refreshUrl, refreshTokenParams)

        if (refreshTokenResponse.status !== 200) {
            throw refreshTokenResponse
        }
        const refreshTokenResult = await refreshTokenResponse.json()
        Store.dispatch(saveToken(refreshTokenResult.idtoken, refreshTokenResult.refreshToken))
        return refreshTokenResult.idtoken

    } catch (error) {
        console.warn('[updateToken] Could not update token.', error)
    }
    return null
}

const _request = async (path, method = 'GET', payload, autoLogout) => {
    const url = `${BASE_URL}${path.replace('//', '/')}`

    const user = Store.getState().user
    let token = user.token
    const refreshToken = user.refreshToken

    // Check if token needs to be updated or use as is.
    // This will return null on error, which will generate a 401 (see 401 handling below).
    token = await AuthTokenUtil.checkAndUpdateToken(token, refreshToken)

    const requestParams = {
        method,
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
    }

    if (method !== 'GET') {
        requestParams.body = JSON.stringify(payload)
    }

    console.log(
        `%c${method} %c${url}%c with payload: `,
        'color: #c242f4',
        'color: blue',
        'color: black',
        payload,
        ' and headers',
        requestParams.headers
    )

    const response = await fetch(url, requestParams)

    if (user.isLoggedIn && autoLogout && response.status === 401 && !isShowingAlert) {
        console.log('was logged out by request', url, 'with params', requestParams)
        //logout immediately - navigate when user presses 'ok'
        Store.dispatch(logOut())
        Alert.alert(
            i18n.t('logged_out.title'),
            i18n.t('logged_out.body'),
            [
                {
                    text: i18n.t('ok'),
                    onPress: () => Store.dispatch(logOutNavigate()),
                },
            ],
            { cancelable: false }
        )
        isShowingAlert = true
    }

    if (response.ok) {
        if (response.status === 204) {
            return {}
        }
        // try catch responses until backend returns valid json
        try {
            const result = await response.json()
            return result
        } catch (error) {
            return
        }
    }

    throw response
}

export default Api
