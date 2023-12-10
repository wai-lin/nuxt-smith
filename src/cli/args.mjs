/* eslint-disable eslint-comments/no-unlimited-disable */
/* eslint-disable */
import * as colorette from 'colorette';

const argumentCases = [
	[
		'create',
		'app',
		'dashboard',
	],
	[
		'create:app',
		'-n',
		'dashboard',
	],
	[
		'create:app',
		'--name',
		'dashboard',
	],
	[
		'create:app',
		'--name=dashboard',
	],
	[
		'create:app',
		'-v',
		'--name',
		'dashboard',
	],
	[
		'create:app',
		'-n',
		'--name',
		'dashboard',
	],
	[
		'create:app',
		'-v',
		'--name',
		'dashboard',
		'-n'
	],
]

// ////////////////////////////////////////
// Impl
// ////////////////////////////////////////
const command = 'create:app'
const argument = ['--name', '-n']

// count of spaces from args to combine
const spacesCmdHas = command.split(':').length

// generate array of ['--name', '-n', '--name=', '-n=']
const argumentsToMatch = []
argumentsToMatch.push(...argument)
argumentsToMatch.push(...(argument.map(a => `${a}=`)))

console.log({ command, spacesCmdHas, argumentsToMatch })

argumentCases.forEach((argCase, index) => {
	console.log()
	console.log(`CASE: ${index + 1} ==========`)

	const firstArg = argCase.at(0) ?? ''
	let restArgs = argCase.slice(1)
	let combined = ''
	if (firstArg === command) {
		console.log({
			Command: command,
			FirstArg: firstArg,
			RestArgs: restArgs,
		})
	} else {
		combined = argCase.slice(0, spacesCmdHas).join(':')
		restArgs = argCase.slice(spacesCmdHas)
		console.log({
			Command: command,
			Combined: combined,
			RestArgs: restArgs,
		})
	}

	// reject if both long and short flags are included
	const isArgContainMoreThanOne = restArgs.map((a) => argument.includes(a)).filter((r) => r === true).length > 1
	if (isArgContainMoreThanOne) {
		console.log(
			colorette.bgRed(` you cannot provide both long and short form of argument : ${argument} `)
		)
		return
	}

	// get flag
	const idx = restArgs.findIndex((arg) => 
		argument.reduce((a, b) => {
			if (a === true) return a
			return arg.startsWith(a) || arg.startsWith(b)
		}, false)
	)
	if (idx < 0) {
		console.log({ value: restArgs.at(0) })
		return
	}

	const isOneLine = restArgs.at(idx).includes('=')
	console.log({ idx })

	if (isOneLine)
		console.log({ isOneLine, value: restArgs.at(idx) })
	else
		console.log({ isOneLine, value: restArgs.slice(idx, idx + 2).join('=') })
})

// export function readArgs() {

// }
