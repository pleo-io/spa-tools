import {getMinifiedConfig} from './get-minified-config'

it('returns a minified config string for inlining in an HTML document', () => {
    const config = {key: 'value'}

    expect(getMinifiedConfig(config)).toMatchInlineSnapshot(
        `"window.___pleoConfig=JSON.parse("{\\"key\\":\\"value\\"}");"`
    )
})
