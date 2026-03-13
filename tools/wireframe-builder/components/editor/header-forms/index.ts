import type { ComponentType } from 'react'
import type { HeaderConfig } from '@tools/wireframe-builder/types/blueprint'
import type { HeaderElementType } from '@tools/wireframe-builder/types/editor'
import HeaderBrandForm from './HeaderBrandForm'
import HeaderPeriodForm from './HeaderPeriodForm'
import HeaderUserForm from './HeaderUserForm'
import HeaderActionsForm from './HeaderActionsForm'

export type HeaderFormProps = {
  headerConfig: HeaderConfig
  configLabel: string
  onUpdate: (updater: (header: HeaderConfig) => HeaderConfig) => void
}

const HEADER_FORMS: Record<HeaderElementType, {
  form: ComponentType<HeaderFormProps>
  label: string
}> = {
  'header-brand': { form: HeaderBrandForm, label: 'Aparencia' },
  'header-period': { form: HeaderPeriodForm, label: 'Periodo' },
  'header-user': { form: HeaderUserForm, label: 'Usuario' },
  'header-actions': { form: HeaderActionsForm, label: 'Acoes' },
}

export function getHeaderForm(type: HeaderElementType): ComponentType<HeaderFormProps> {
  return HEADER_FORMS[type].form
}

export function getHeaderElementLabel(type: HeaderElementType): string {
  return HEADER_FORMS[type].label
}

export const HEADER_ELEMENT_TYPES = Object.keys(HEADER_FORMS) as HeaderElementType[]
