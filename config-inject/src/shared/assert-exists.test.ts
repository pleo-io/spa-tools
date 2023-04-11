import * as fs from 'node:fs'
import {assertExists} from './assert-exists'

jest.mock('node:fs')
const mockExist = fs.existsSync as jest.MockedFn<typeof fs.existsSync>
const mockLstat = fs.lstatSync as jest.MockedFn<typeof fs.lstatSync>

afterEach(() => {
    jest.restoreAllMocks()
})

it('does not throw an error if the path exists and is a file', () => {
    const testPath = './test-file.txt'
    mockExist.mockReturnValue(true)
    mockLstat.mockReturnValue({isDirectory: () => false} as any)

    expect(() => assertExists(testPath)).not.toThrow()
})

it('throws an error if the path does not exist', () => {
    const testPath = './non-existent-file.txt'
    mockExist.mockReturnValue(false)

    expect(() => assertExists(testPath)).toThrow(`${testPath} does not exist`)
})

it('does not throw an error if the path exists and is a directory', () => {
    const testPath = './test-dir'
    mockExist.mockReturnValue(true)
    mockLstat.mockReturnValue({isDirectory: () => true} as any)

    expect(() => assertExists(testPath, {dir: true})).not.toThrow()
})

it('throws an error if the path exists but is not a directory', () => {
    const testPath = './test-file.txt'
    mockExist.mockReturnValue(true)
    mockLstat.mockReturnValue({isDirectory: () => false} as any)

    expect(() => assertExists(testPath, {dir: true})).toThrow(`${testPath} is not a directory`)
})
