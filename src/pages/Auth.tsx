
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import Navigation from "@/components/Navigation";

const authSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type AuthMode = "signin" | "signup";

function friendlyAuthError(err: unknown): string {
  const msg = err instanceof Error ? err.message : "Something went wrong";

  if (/User already registered/i.test(msg) || /user_already_exists/i.test(msg)) {
    return "This email already has an account. Please sign in instead.";
  }

  if (/Invalid login credentials/i.test(msg) || /invalid_credentials/i.test(msg)) {
    return "Invalid email or password.";
  }

  return msg;
}

export default function Auth() {
  const [mode, setMode] = useState<AuthMode>("signin");
  const [useEmailLink, setUseEmailLink] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();

  const emailRedirectTo = useMemo(() => `${window.location.origin}/chat`, []);

  // If already signed in, keep users out of the auth screen.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) navigate("/chat", { replace: true });
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) navigate("/chat", { replace: true });
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const parsed = authSchema.safeParse({ email, password });

      // For email-link sign-in we only need the email.
      if (useEmailLink) {
        const emailOnly = z.string().email("Enter a valid email").safeParse(email);
        if (!emailOnly.success) {
          toast({
            variant: "destructive",
            title: "Check your email",
            description: emailOnly.error.issues[0]?.message ?? "Enter a valid email",
          });
          return;
        }

        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: { emailRedirectTo },
        });
        if (error) throw error;

        toast({
          title: "Check your inbox",
          description: "We sent you a sign-in link.",
        });
        return;
      }

      if (!parsed.success) {
        toast({
          variant: "destructive",
          title: "Fix the form",
          description: parsed.error.issues[0]?.message ?? "Invalid form values",
        });
        return;
      }

      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo },
        });

        if (error) throw error;

        toast({
          title: "Account created",
          description: "If email confirmation is enabled, check your inbox to confirm.",
        });
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      navigate("/chat", { replace: true });
    } catch (err) {
      const message = friendlyAuthError(err);

      // If they attempted signup but the user exists, flip them to sign-in mode.
      if (mode === "signup" && /already has an account/i.test(message)) {
        setMode("signin");
      }

      toast({
        variant: "destructive",
        title: "Error",
        description: message,
      });
    } finally {
      setLoading(false);
    }
  };

  const title = mode === "signup" ? "Create account" : "Welcome back";
  const subtitle = useEmailLink
    ? "We’ll email you a sign-in link"
    : mode === "signup"
      ? "Sign up to get started"
      : "Sign in to continue";

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div
        className="flex items-center justify-center p-4"
        style={{ minHeight: "calc(100vh - 64px)" }}
      >
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold">{title}</h1>
            <p className="text-muted-foreground mt-2">{subtitle}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />

            {!useEmailLink && (
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
              />
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading
                ? "Loading..."
                : useEmailLink
                  ? "Email me a link"
                  : mode === "signup"
                    ? "Sign up"
                    : "Sign in"}
            </Button>
          </form>

          <div className="flex flex-col gap-3 text-center">
            <button
              type="button"
              onClick={() => setUseEmailLink((v) => !v)}
              className="text-sm text-muted-foreground hover:text-primary"
            >
              {useEmailLink ? "Use password instead" : "Email me a sign-in link"}
            </button>

            {!useEmailLink && (
              <button
                type="button"
                onClick={() => setMode((m) => (m === "signup" ? "signin" : "signup"))}
                className="text-sm text-muted-foreground hover:text-primary"
              >
                {mode === "signup"
                  ? "Already have an account? Sign in"
                  : "Need an account? Sign up"}
              </button>
            )}

            <Link to="/chat" className="text-sm text-muted-foreground hover:text-primary">
              Back to chat
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

