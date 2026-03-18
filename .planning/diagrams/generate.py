from diagrams import Diagram, Cluster, Edge
from diagrams.onprem.client import Users, Client
from diagrams.onprem.compute import Server
from diagrams.onprem.database import PostgreSQL
from diagrams.programming.framework import React
from diagrams.programming.language import TypeScript
from diagrams.saas.identity import Auth0
from diagrams.generic.database import SQL
from diagrams.generic.compute import Rack
from diagrams.generic.storage import Storage
from diagrams.generic.network import Firewall
import os

out = os.path.join(os.path.dirname(os.path.abspath(__file__)), "fxl-core-architecture")

ga = {
    "fontsize": "32",
    "fontname": "Helvetica",
    "bgcolor": "#ffffff",
    "fontcolor": "#1a1a1a",
    "pad": "1.2",
    "nodesep": "1.0",
    "ranksep": "1.5",
    "dpi": "300",
}

na = {
    "fontsize": "13",
    "fontname": "Helvetica",
    "fontcolor": "#1a1a1a",
    "imagescale": "true",
    "fixedsize": "true",
    "width": "1.8",
    "height": "1.8",
}

ea = {
    "fontsize": "11",
    "fontname": "Helvetica",
    "fontcolor": "#555555",
    "color": "#aaaaaa",
    "penwidth": "1.5",
}

cs = {
    "fontsize": "16",
    "fontname": "Helvetica Bold",
    "fontcolor": "#1a1a1a",
    "style": "rounded,dashed",
    "color": "#cccccc",
    "bgcolor": "#f8f9fa",
    "penwidth": "2",
}

inner = {**cs, "bgcolor": "#eef1f5", "fontsize": "13", "style": "rounded"}

with Diagram(
    "FXL Core (Nexo) — Arquitetura do Sistema",
    filename=out,
    show=False,
    direction="TB",
    graph_attr=ga,
    node_attr=na,
    edge_attr=ea,
    outformat="png",
):

    users = Users("Operadores\nFXL")

    # ── Row 1: Frontend ──
    with Cluster("VERCEL  —  Frontend SPA", graph_attr={**cs, "bgcolor": "#f0f4ff"}):

        with Cluster("Provider Chain", graph_attr={**inner, "bgcolor": "#e8eeff"}):
            providers = React("ClerkProvider\nImpersonation\nModuleEnabled\nExtension")

        with Cluster("App Shell", graph_attr={**inner, "bgcolor": "#e8eeff"}):
            shell = Client("TopNav + OrgPicker\nSidebar (Dynamic)\nReact Router v6")

        with Cluster("6 Feature Modules", graph_attr={**inner, "bgcolor": "#e8eeff"}):
            modules = React("Docs  •  Projects\nTasks  •  Clients\nConnector  •  Wireframe")

        with Cluster("Admin Panel", graph_attr={**inner, "bgcolor": "#fff0f0"}):
            admin = Client("Dashboard  •  Users\nTenants  •  Modules\n(super_admin only)")

        with Cluster("UI Stack", graph_attr={**inner, "bgcolor": "#e8eeff"}):
            ui_stack = TypeScript("shadcn/ui + Tailwind 3\nLucide  •  recharts\nzod  •  dnd-kit")

    # ── Row 2: External Services ──
    with Cluster("CLERK CLOUD  —  Identity & Multi-Tenancy", graph_attr={**cs, "bgcolor": "#f3f0ff"}):
        clerk_auth = Auth0("Users\nSessions\nGoogle OAuth")
        clerk_orgs = Auth0("Organizations\n(= Tenants)")
        clerk_jwks = Firewall("JWKS\nPublic Keys")

    with Cluster("SUPABASE  —  Backend & Data", graph_attr={**cs, "bgcolor": "#f0fff4"}):

        with Cluster("Edge Functions  (Deno)", graph_attr={**inner, "bgcolor": "#e0f5e8"}):
            ef_token = Server("auth-token-exchange\nClerk JWT → Supabase JWT")
            ef_admin = Server("admin-users\nadmin-tenants\n(Clerk API proxy)")

        with Cluster("PostgreSQL  +  RLS  (org_id isolation)", graph_attr={**inner, "bgcolor": "#e0f5e8"}):
            db_main = PostgreSQL("documents  •  tasks\nclients  •  projects")
            db_meta = SQL("tenant_modules\nknowledge_entries\nplatform_settings\ncomments")

    with Cluster("MCP SERVER  —  AI Knowledge  (CF Workers)", graph_attr={**cs, "bgcolor": "#fff8f0"}):
        mcp = Rack("Standards  •  Learnings  •  Pitfalls\n(consumed by Claude Code)")

    # ──────────── Connections ────────────

    # User → App
    users >> Edge(color="#2563eb", style="bold", label="HTTPS") >> providers

    # Internal app flow
    providers >> Edge(color="#7c3aed", style="bold") >> shell
    shell >> Edge(color="#16a34a", style="bold", label="ProtectedRoute") >> modules
    shell >> Edge(color="#dc2626", style="bold", label="SuperAdminRoute") >> admin

    # Auth flow
    providers >> Edge(color="#7c3aed", style="bold", label="Sessions & Auth") >> clerk_auth
    providers >> Edge(color="#7c3aed", style="dashed") >> clerk_orgs

    # Token exchange
    shell >> Edge(color="#ca8a04", style="dashed", label="① Clerk JWT") >> ef_token
    ef_token >> Edge(color="#ca8a04", style="dashed", label="② Validate") >> clerk_jwks
    ef_token >> Edge(color="#16a34a", style="bold", label="③ Supabase JWT\n   (org_id claim)") >> db_main

    # Admin → Edge Functions → Clerk
    admin >> Edge(color="#dc2626", style="dashed", label="Proxy calls") >> ef_admin
    ef_admin >> Edge(color="#7c3aed", style="dashed", label="Clerk API") >> clerk_orgs

    # Modules → DB
    modules >> Edge(color="#16a34a", style="bold", label="RLS-enforced\nqueries") >> db_main

    # Tenant control
    db_meta >> Edge(color="#ca8a04", style="dashed", label="module\nvisibility") >> providers

    # MCP reads DB
    mcp >> Edge(color="#ea580c", style="dashed", label="reads knowledge") >> db_meta


print(f"OK: {out}.png")
