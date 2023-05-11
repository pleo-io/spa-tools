import {getCookie} from './utils'

describe(`getCookie`, () => {
    test(`default run`, async () => {
        const pleoAbUniqueIdValue = 'FSf7ljORURe556Kk8-KOL'
        const value = getCookie(
            {
                cookie: [
                    {
                        key: 'cookie',
                        value: `pleo-ab-unique-id=${pleoAbUniqueIdValue}; _ga=GA1.2.766092372.1651495092;`
                    }
                ]
            },
            'pleo-ab-unique-id'
        )

        expect(value).toBe(pleoAbUniqueIdValue)
    })

    test(`empty cookie header`, async () => {
        const value = getCookie(
            {
                cookie: undefined
            },
            'pleo-ab-unique-id'
        )

        expect(value).toBe(null)

        const valueWithEmptyArray = getCookie(
            {
                cookie: []
            },
            'pleo-ab-unique-id'
        )

        expect(valueWithEmptyArray).toBe(null)

        const valueWithEmptyCookieValue = getCookie(
            {
                cookie: [
                    {
                        key: 'cookie',
                        value: ''
                    }
                ]
            },
            'pleo-ab-unique-id'
        )

        expect(valueWithEmptyCookieValue).toBe(null)
    })

    test(`return null with no cookie with such name`, async () => {
        const pleoAbUniqueIdValue = 'FSf7ljORURe556Kk8-KOL'
        const value = getCookie(
            {
                cookie: [
                    {
                        key: 'cookie',
                        value: `pleo-ab-unique-ok=${pleoAbUniqueIdValue}; _ga=GA1.2.766092372.1651495092;`
                    }
                ]
            },
            'pleo-ab-unique-id'
        )

        expect(value).toBe(null)
    })
})
