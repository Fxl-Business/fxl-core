import { useClerk, useUser } from '@clerk/react'
import { useNavigate } from 'react-router-dom'
import { Building2, Shield } from 'lucide-react'
import { Button } from '@shared/ui/button'
import { Card, CardContent, CardFooter } from '@shared/ui/card'

export default function SolicitarAcesso() {
  const { signOut } = useClerk()
  const { user } = useUser()
  const navigate = useNavigate()

  const isSuperAdmin = user?.publicMetadata?.super_admin === true

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 dark:bg-background">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-foreground">Nexo</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Plataforma operacional interna</p>
      </div>

      <Card className="w-full max-w-sm">
        <CardContent className="pt-6 pb-2 text-center">
          <Building2 className="h-10 w-10 text-slate-400 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-slate-900 dark:text-foreground mb-2">
            Conta criada com sucesso
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Sua conta foi criada. Para acessar a plataforma, solicite acesso a uma organização ao administrador do Nexo.
          </p>
        </CardContent>

        <CardFooter className="flex-col gap-2 pt-4">
          {isSuperAdmin && (
            <Button
              className="w-full gap-2"
              onClick={() => navigate('/admin')}
            >
              <Shield className="h-4 w-4" />
              Painel Admin
            </Button>
          )}
          <Button
            variant="outline"
            className="w-full"
            onClick={handleSignOut}
          >
            Sair da conta
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
