import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BRAND_LOGO } from "@/lib/constants";

export default function AdminLoginPage() {
  const { login, checkAuth } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkAuth().then(ok => {
      if (ok) navigate("/admin/dashboard", { replace: true });
      setChecking(false);
    });
  }, [checkAuth, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Bienvenido al panel de administracion");
      navigate("/admin/dashboard", { replace: true });
    } catch (err) {
      const detail = err.response?.data?.detail;
      const msg = typeof detail === "string" ? detail : Array.isArray(detail) ? detail.map(d => d.msg || JSON.stringify(d)).join(" ") : "Error al iniciar sesion";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (checking) return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4" data-testid="admin-login-page">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <img src={BRAND_LOGO} alt="Atelier Fleurs" className="h-16 w-16 mx-auto rounded-full object-cover mb-4" />
          <h1 className="text-2xl font-semibold tracking-tight" style={{ fontFamily: 'Outfit' }}>Panel Admin</h1>
          <p className="text-muted-foreground text-sm mt-1">Floristeria Atelier Fleurs</p>
        </div>

        <div className="bg-card rounded-2xl border border-border p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-email">Email</Label>
              <Input id="admin-email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@atelierfleurs.com" data-testid="admin-email-input" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-password">Contrasena</Label>
              <Input id="admin-password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Tu contrasena" data-testid="admin-password-input" />
            </div>
            <Button type="submit" disabled={loading} className="w-full rounded-full bg-primary hover:bg-primary/90 text-white gap-2" data-testid="admin-login-button">
              <Lock className="h-4 w-4" /> {loading ? "Ingresando..." : "Ingresar"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
