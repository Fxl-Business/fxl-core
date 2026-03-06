import type { Config, Schema } from '@markdoc/markdoc'

const callout: Schema = {
  render: 'Callout',
  attributes: {
    type: { type: String, default: 'info', matches: ['info', 'warning'] },
  },
  children: ['paragraph', 'tag', 'list'],
}

const prompt: Schema = {
  render: 'PromptBlock',
  attributes: {
    label: { type: String, required: true },
  },
  children: ['paragraph', 'tag', 'list'],
}

const operational: Schema = {
  render: 'Operational',
  children: ['paragraph', 'tag', 'list', 'heading'],
}

const phaseCard: Schema = {
  render: 'PhaseCard',
  selfClosing: true,
  attributes: {
    number: { type: Number, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    href: { type: String, required: true },
  },
}

const config: Config = {
  tags: {
    callout,
    prompt,
    operational,
    'phase-card': phaseCard,
  },
}

export default config
