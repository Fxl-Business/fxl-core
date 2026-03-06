import { useParams } from 'react-router-dom'
import Markdoc from '@markdoc/markdoc'
import React from 'react'
import { getDoc } from '@/lib/markdoc'
import Callout from '@/components/markdoc/Callout'
import Operational from '@/components/markdoc/Operational'
import MarkdocPromptBlock from '@/components/markdoc/MarkdocPromptBlock'

// Map Markdoc component names to React components
const components = {
  Callout,
  Operational,
  PromptBlock: MarkdocPromptBlock,
}

export default function DocRenderer() {
  const params = useParams()
  // Reconstruct the path from wildcard param
  const path = params['*'] || ''

  const doc = getDoc(path)

  if (!doc) {
    return (
      <div className="py-12 text-center">
        <h1 className="text-lg font-semibold text-slate-700">Pagina nao encontrada</h1>
        <p className="mt-2 text-sm text-slate-500">
          Nao foi possivel encontrar um documento para o caminho: /{path}
        </p>
      </div>
    )
  }

  const { frontmatter, content } = doc

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        {frontmatter.badge && (
          <span className="mb-2 inline-block rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
            {frontmatter.badge}
          </span>
        )}
        <h1 className="text-2xl font-bold text-slate-900">{frontmatter.title}</h1>
        {frontmatter.description && (
          <p className="mt-2 text-sm text-slate-500">{frontmatter.description}</p>
        )}
      </div>

      {/* Rendered Markdoc content */}
      <div className="prose max-w-none">
        {Markdoc.renderers.react(content, React, { components })}
      </div>
    </div>
  )
}
