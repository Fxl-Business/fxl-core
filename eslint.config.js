import boundaries from 'eslint-plugin-boundaries'
import tsParser from '@typescript-eslint/parser'
import reactHooks from 'eslint-plugin-react-hooks'

export default [
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
    },
    plugins: {
      boundaries,
      'react-hooks': reactHooks,
    },
    settings: {
      'boundaries/elements': [
        { type: 'module', pattern: 'src/modules/!(registry)*' },
        { type: 'component', pattern: 'src/components/*' },
        { type: 'page', pattern: 'src/pages/*' },
        { type: 'lib', pattern: 'src/lib/*' },
      ],
    },
    rules: {
      'react-hooks/exhaustive-deps': 'warn',
      'boundaries/element-types': [
        'error',
        {
          default: 'allow',
          rules: [
            { from: 'module', disallow: ['module'] },
          ],
        },
      ],
    },
  },
]
