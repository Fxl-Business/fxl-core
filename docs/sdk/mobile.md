---
title: Mobile
badge: SDK
description: React Native, Expo, compartilhamento de codigo e push notifications
scope: product
sort_order: 130
---

# Mobile

{% callout type="info" %}
Nenhum spoke FXL tem componente mobile em producao ainda. Esta pagina documenta os padroes recomendados para quando um projeto spoke incluir app mobile.
{% /callout %}

## Stack Recomendada

| Camada | Tecnologia | Versao | Notas |
|--------|-----------|--------|-------|
| Framework | React Native | 0.7x | Via Expo |
| Plataforma | Expo | SDK 51+ | Managed workflow |
| Navegacao | React Navigation | 6.x | Stack + Tab navigators |
| Estilo | NativeWind | 4.x | Tailwind CSS para React Native |
| Icones | lucide-react-native | latest | Consistente com web |
| Estado | Zustand ou Context API | latest | Mesmo padrao do web |
| Banco | @supabase/supabase-js | 2.x | Mesmo SDK do web |
| Auth | @clerk/clerk-expo | latest | SDK Clerk para Expo |

## Estrutura de Projeto

```
mobile/
  app/                        # Expo Router screens
    (tabs)/
      index.tsx               # Home tab
      dashboard.tsx           # Dashboard tab
    _layout.tsx               # Root layout
  components/                 # Mobile-specific components
  hooks/                      # Mobile-specific hooks
  shared/                     # Symlink ou copy de types/utils/services do web
    types/
    utils/
    services/
```

{% callout type="info" %}
Usar Expo Router (file-based routing) em vez de React Navigation manual. A estrutura de pastas define as rotas automaticamente.
{% /callout %}

## Compartilhamento Web/Mobile

Nem todo codigo web pode ser reutilizado no mobile. A tabela abaixo mostra o que pode ser compartilhado:

| Camada | Compartilhavel? | Como | Exemplo |
|--------|----------------|------|---------|
| `types/` (interfaces, DTOs) | Sim | Copiar ou monorepo | `User`, `Dashboard`, `Widget` |
| `utils/` (formatadores, validadores) | Sim | Copiar ou monorepo | `formatCurrency`, `validateEmail` |
| `services/` (API calls, Supabase) | Sim* | Sem dependencia de DOM | `supabase.from('users').select()` |
| `components/` | Nao | APIs diferentes (`View` vs `div`) | — |
| `hooks/` (com UI state) | Nao | Depende de `react-dom` | `useModal`, `useToast` |
| `hooks/` (sem UI state) | Sim | Logica pura | `useAuth`, `useSupabase` |

{% callout type="info" %}
Para compartilhamento real, considerar monorepo com Turborepo. Para projetos menores, copiar `types/` e `services/` e suficiente.
{% /callout %}

### Estrutura Monorepo (Turborepo)

```
project/
  apps/
    web/                      # Vite SPA (spoke web)
    mobile/                   # Expo app
  packages/
    shared/                   # Codigo compartilhado
      types/
      utils/
      services/
  turbo.json
  package.json
```

## Push Notifications

### Setup

```bash
npx expo install expo-notifications expo-device
```

### Solicitar Permissao

```typescript
import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'

async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) {
    console.warn('Push notifications requerem dispositivo fisico')
    return null
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync()
  let finalStatus = existingStatus

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync()
    finalStatus = status
  }

  if (finalStatus !== 'granted') {
    return null
  }

  const token = (await Notifications.getExpoPushTokenAsync()).data
  return token
}
```

### Registrar Token no Backend

Salvar o push token no Supabase para envio posterior:

```typescript
async function saveToken(userId: string, token: string) {
  await supabase
    .from('push_tokens')
    .upsert({ user_id: userId, token, platform: Platform.OS })
}
```

### Enviar Notificacao

Via Expo Push API (server-side):

```typescript
await fetch('https://exp.host/--/api/v2/push/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    to: pushToken,
    title: 'Novo relatorio disponivel',
    body: 'O dashboard de vendas foi atualizado.',
    data: { screen: 'dashboard' },
  }),
})
```

{% callout type="warning" %}
Push notifications requerem build nativo (nao funciona no Expo Go). Usar EAS Build para testes.
{% /callout %}

## Publicacao nas App Stores

### Build e Submit com EAS

```bash
# Instalar EAS CLI
npm install -g eas-cli

# Build para iOS e Android
eas build --platform all

# Submit para as stores
eas submit --platform ios
eas submit --platform android
```

### Apple App Store

| Requisito | Detalhe |
|-----------|---------|
| Conta | Apple Developer Program ($99/ano) |
| Review | App Store Connect review (1-3 dias) |
| Certificados | Gerenciados automaticamente pelo EAS |
| TestFlight | Usar para beta testing antes do release |

### Google Play Store

| Requisito | Detalhe |
|-----------|---------|
| Conta | Google Play Console ($25 one-time) |
| Review | Google Play review (horas a dias) |
| Signing | Upload key gerenciada pelo EAS |
| Teste interno | Google Play Internal Testing para beta |

{% callout type="info" %}
Manter `app.json` com versao semantica. Incrementar `buildNumber` (iOS) e `versionCode` (Android) a cada submit.
{% /callout %}

### Configuracao Minima do app.json

```json
{
  "expo": {
    "name": "Spoke Mobile",
    "slug": "spoke-mobile",
    "version": "1.0.0",
    "ios": {
      "bundleIdentifier": "app.fxl.spoke",
      "buildNumber": "1"
    },
    "android": {
      "package": "app.fxl.spoke",
      "versionCode": 1
    }
  }
}
```
