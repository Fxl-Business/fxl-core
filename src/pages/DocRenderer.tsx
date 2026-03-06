import { useLocation } from 'react-router-dom'
import Markdoc from '@markdoc/markdoc'
import React from 'react'
import { getDoc } from '@/lib/markdoc'
import Callout from '@/components/markdoc/Callout'
import Operational from '@/components/markdoc/Operational'
import MarkdocPromptBlock from '@/components/markdoc/MarkdocPromptBlock'

const components = {
  Callout,
  Operational,
  PromptBlock: MarkdocPromptBlock,
}

export default function DocRenderer() {
  const location = useLocation()
  const doc = getDoc(location.pathname)

  if (!doc) {
    return (
      <div className="py-12 text-center">
        <h1 className="text-lg font-semibold text-slate-700">Pagina nao encontrada</h1>
        <p className="mt-2 text-sm text-slate-500">
          Nao foi possivel encontrar um documento para: {location.pathname}
        </p>
      </div>
    )
  }

  const { frontmatter, content } = doc

  return (
    <div>
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

      <div className="prose max-w-none">
        {Markdoc.renderers.react(content, React, { components })}
      </div>
    </div>
  )
}
