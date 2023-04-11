import * as configUtils from './load-config'

it('returns a parsed and validated config object', () => {
    const rawConfig = {
        configDir: 'test-config',
        buildDir: 'test-build'
    }
    const expectedConfig = {
        configDir: 'test-config',
        buildDir: 'test-build',
        templateFileName: '_index.html',
        outputFileName: 'index.html',
        devConfigOverrideFile: 'config.dev.json'
    }

    expect(configUtils.parseConfig(rawConfig)).toEqual(expectedConfig)
})

it('logs an error and exits the process if the config is invalid', () => {
    const rawConfig = {
        configDir: 'test-config',
        buildDir: null // Invalid config value
    }

    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('process.exit called')
    })
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => configUtils.parseConfig(rawConfig)).toThrow('process.exit called')
    expect(exitSpy).toHaveBeenCalledWith(1)
    expect(errorSpy).toHaveBeenCalledTimes(1)
})
