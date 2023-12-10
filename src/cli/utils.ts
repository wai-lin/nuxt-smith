export type DataType = 'string' | 'number' | 'boolean'

/**
 * Read Command from system arguments
 */
export function readCommand(cmd: string, sysArgs: string[]) {
	let command = cmd
	let restArgs = sysArgs.slice(1)

	const firstArg = sysArgs.at(0) ?? ''
	if (firstArg === cmd)
		return { command, restArgs }

	const spacesCmdHas = cmd.split(':').length
	command = sysArgs.slice(0, spacesCmdHas).join(':')
	if (command !== cmd)
		return null

	restArgs = sysArgs.slice(spacesCmdHas)
	return { command, restArgs }
}

export interface ArgumentCategory {
	flag: boolean
	isPrevFlag: boolean
	value: string
}
/**
 * Categorize Arguments from restArgs of Command Reader
 */
export function categorizeArguments(restArgs: string[]) {
	return restArgs.reduce((a, b, index) => {
		return a.concat({
			flag: b.startsWith('--') || b.startsWith('-'),
			isPrevFlag: a.at(index - 1)?.flag || false,
			value: b,
		})
	}, [] as Array<ArgumentCategory>)
}

/**
 * Validate the system argument payload with command definition.
 * Also type-case the value if type is provided.
 */
export function processValue(
	payload: { key: string, value?: string },
	options: { required: boolean, type: DataType } = { required: false, type: 'string' },
) {
	if (options.required && !payload.value)
		throw new Error('Value is required.')

	if (typeof payload.value === 'undefined')
		return undefined

	let value: string | number | boolean = payload.value
	if (options.type === 'boolean')
		value = !!payload.value
	if (options.type === 'number')
		value = Number(payload.value)
	return value
}

/**
 * Get none flagged arguments from categorized arguments
 */
export function readArguments(
	argsNames: Array<{ name: string, required: boolean, type: DataType }>,
	catArgs: ArgumentCategory[],
) {
	const filteredArguments = catArgs.filter(c => !c.flag && !c.isPrevFlag)

	const mappedArgs: Record<string, string | number | boolean | undefined> = {}
	argsNames.forEach(({ name, required, type }, index) => {
		const value = filteredArguments.at(index)?.value
		mappedArgs[name] = processValue({ key: name, value }, { required, type })
	})
	return mappedArgs
}

/**
 * Get flagged arguments from categorized arguments
 */
export function readFlags(
	flagsNames: Array<{ name: string, char: string, required: boolean, type: DataType }>,
	catArgs: ArgumentCategory[],
) {
	const filteredFlags = catArgs.filter(c => c.flag || c.isPrevFlag)

	const mappedFlags: Record<string, string | number | boolean | undefined> = {}

	// prefill flags
	flagsNames.forEach(({ name }) => mappedFlags[name] = undefined)

	// fill sync flag value with system arguments
	let index = 0
	do {
		const a = filteredFlags.at(index)
		const b = filteredFlags.at(index + 1)

		if (a && !b)
			mappedFlags[a.value] = undefined
		if (a && b)
			mappedFlags[a.value] = b.value

		index += 2
	} while (index < filteredFlags.length)

	return mappedFlags
}

/**
 * Read system arguments and find help flag. Return the rest arguments if help is found.
 */
export function readHelpFlag(sysArgs: string[]) {
	const hasHelpFlag = sysArgs.findIndex(a => a === '-h' || a === '--help')
	if (hasHelpFlag < 0)
		return null
	return sysArgs.filter(a => a !== '-h' && a !== '--help')
}
