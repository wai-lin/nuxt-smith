import { createCommand } from '../../cli/cmd';

export default createCommand({
	command: 'init',
	description: 'initialize scaffolding of monorepo.',
	args: {
		name: { description: 'name of the project', required: true },
	},
	flags: {
		name: { description: 'name of the project' },
	},
	run(ctx) {
		console.warn(ctx)
	},
})
