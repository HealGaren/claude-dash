import js from '@eslint/js'
import prettier from 'eslint-config-prettier'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['**/dist/**', '**/node_modules/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,

  // 전체 TS/TSX 파일 공통 규칙
  {
    files: ['packages/*/src/**/*.{ts,tsx}'],
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      // import 정리
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            // 외부 패키지
            ['^[^.@\\u0000]'],
            // @로 시작하되 @cdash, @/ 제외
            ['^@(?!cdash|/)'],
            // @cdash/*
            ['^@cdash/'],
            // @/* (path alias)
            ['^@/'],
            // 상대경로
            ['^\\.'],
            // side-effect imports
            ['^\\u0000'],
          ],
        },
      ],
      'simple-import-sort/exports': 'error',

      // TypeScript 품질
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: ['interface', 'typeAlias'],
          format: ['PascalCase'],
        },
      ],

      // 아키텍처 강제
      'max-lines-per-function': ['error', { max: 150, skipBlankLines: true, skipComments: true }],
      complexity: ['error', 10],
      'max-params': ['error', 4],

      // default export 금지 (pages/와 설정 파일 제외)
      'no-restricted-exports': [
        'error',
        { restrictDefaultExports: { direct: true, named: true, namedFrom: true, defaultFrom: true } },
      ],
    },
  },

  // React (web 패키지) 전용 규칙
  {
    files: ['packages/web/src/**/*.{ts,tsx}'],
    plugins: {
      'react-hooks': reactHooks,
      react,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,

      // React 품질
      'react/no-unstable-nested-components': 'error',
      'react/jsx-no-leaked-render': 'error',
      'react/no-array-index-key': 'error',
      'react/self-closing-comp': 'error',
      'react/jsx-curly-brace-presence': ['error', { props: 'never', children: 'never' }],
      'react/function-component-definition': [
        'error',
        { namedComponents: 'arrow-function', unnamedComponents: 'arrow-function' },
      ],
    },
    settings: {
      react: { version: '19' },
    },
  },

  // pages/ 하위 및 설정 파일은 default export 허용
  {
    files: [
      'packages/web/src/pages/**/*.{ts,tsx}',
      '*.config.{js,mjs,ts}',
      'packages/*/vite.config.ts',
    ],
    rules: {
      'no-restricted-exports': 'off',
    },
  },

  // test 파일은 아키텍처 규칙 완화
  {
    files: ['packages/*/src/**/*.test.{ts,tsx}'],
    rules: {
      'max-lines-per-function': 'off',
      'no-restricted-exports': 'off',
    },
  },

  prettier,
)
