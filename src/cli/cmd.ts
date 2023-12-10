import process from 'node:process';
import type { DataType } from './utils';
import { categorizeArguments, readArguments, readCommand, readFlags } from './utils';

export interface CommandArgument {
	description: string
	required?: boolean
	type?: DataType
}

export interface CommandFlag {
	description: string
	char?: string
	required?: boolean
	type?: DataType
}

export interface RunContext<Args, Flags> {
	args: Args
	flags: Flags
}

export interface CommandOptions<
	Args extends { [k: string]: CommandArgument },
	Flags extends { [k: string]: CommandFlag },
	ArgsNames extends keyof Args = keyof Args,
	FlagsNames extends keyof Flags = keyof Flags,
> {
	command: string
	description: string
	example?: string
	args?: Args
	flags?: Flags
	run: (context: RunContext<
	{ [ArgKey in ArgsNames]: string | undefined },
	{ [FlagKey in FlagsNames]: string | undefined }
	>) => void | Promise<void>
}

/**
 * Create command meta data to execute.
 */
export function createCommand<
	Args extends Record<string, CommandArgument>,
	Flags extends Record<string, CommandFlag>,
>(options: CommandOptions<Args, Flags>) {
	// sanitize spaced commands to full-colon separated command,
	// which is optimized for internal processing
	options.command = options.command.split(' ').join(':').trim()
	return options
}

/**
 * Execute commands matching and run the matched command.
 */
export async function runCommands(commands: CommandOptions<
Record<string, CommandArgument>,
Record<string, CommandFlag>
>[]) {
	const sysArgs = process.argv.slice(2)

	// TODO: run help function if flag is found
	// const helpFlags = readHelpFlag(sysArgs)
	// if (helpFlags) {
	// show help for specific command
	// }

	// get matched command
	let matchedCmd: null | ReturnType<typeof readCommand> = null
	let cmdOptions: null | CommandOptions<
	Record<string, CommandArgument>,
	Record<string, CommandFlag>
	> = null
	for (const cmd of commands) {
		const readCmd = readCommand(cmd.command, sysArgs)
		if (readCmd !== null) {
			matchedCmd = readCmd
			cmdOptions = cmd
			break
		}
	}
	if (matchedCmd === null)
		return console.error('Command not found!')

	const argsNames = Object.keys(cmdOptions?.args ?? {})
	const flagsNames = Object.keys(cmdOptions?.flags ?? {})
	const categories = categorizeArguments(matchedCmd.restArgs)

	const args = readArguments(argsNames, categories)
	const flags = readFlags(flagsNames, categories)

	await cmdOptions?.run({ args, flags })

	console.warn({ matchedCmd, cmdOptions, args, flags })
}
