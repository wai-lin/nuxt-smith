import antfu from '@antfu/eslint-config';

export default antfu(
	{
		rules: {
			'style/semi': 'off',
			'style/no-tabs': 'off',
			'style/indent': ['error', 'tab'],
		},
	},
)
