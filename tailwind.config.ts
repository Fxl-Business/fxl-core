import type { Config } from 'tailwindcss'
import animate from 'tailwindcss-animate'

const config: Config = {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './skills/**/*.{js,ts,jsx,tsx}',
    './clients/**/*.{js,ts,jsx,tsx}',
    './tools/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
  	extend: {
  		colors: {
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				border: 'hsl(var(--sidebar-border))',
  				muted: 'hsl(var(--sidebar-muted))',
  				'muted-foreground': 'hsl(var(--sidebar-muted-foreground))'
  			},
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			/* Wireframe design system tokens (--wf-* CSS variables, hex/rgba values) */
  			wf: {
  				canvas: 'var(--wf-canvas)',
  				card: 'var(--wf-card)',
  				'card-border': 'var(--wf-card-border)',
  				heading: 'var(--wf-heading)',
  				body: 'var(--wf-body)',
  				muted: 'var(--wf-muted)',
  				accent: 'var(--wf-accent)',
  				'accent-muted': 'var(--wf-accent-muted)',
  				'accent-fg': 'var(--wf-accent-fg)',
  				positive: 'var(--wf-positive)',
  				negative: 'var(--wf-negative)',
  				sidebar: {
  					DEFAULT: 'var(--wf-sidebar-bg)',
  					fg: 'var(--wf-sidebar-fg)',
  					active: 'var(--wf-sidebar-active)',
  					muted: 'var(--wf-sidebar-muted)',
  					border: 'var(--wf-sidebar-border)',
  				},
  				'table-header': {
  					DEFAULT: 'var(--wf-table-header-bg)',
  					fg: 'var(--wf-table-header-fg)',
  				},
  				'table-row-alt': 'var(--wf-table-row-alt)',
  				'table-border': 'var(--wf-table-border)',
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		fontFamily: {
  			sans: [
  				'Inter Variable',
  				'Inter',
  				'system-ui',
  				'sans-serif'
  			],
  			mono: [
  				'JetBrains Mono',
  				'Fira Code',
  				'monospace'
  			]
  		}
  	}
  },
  plugins: [animate],
}

export default config
