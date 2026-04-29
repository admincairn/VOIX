// ============================================================
// VOIX — Sign In Page
// Premium authentication with social + magic link
// ============================================================

"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Chrome,
  Github,
  Mail,
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

function SignInForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const error = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const handleSocialSignIn = async (provider: string) => {
    setIsLoading(provider);
    await signIn(provider, { callbackUrl });
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading("magic");
    await signIn("email", { email, callbackUrl });
    setMagicLinkSent(true);
    setIsLoading(null);
  };

  const errorMessages: Record<string, string> = {
    OAuthSignin: "Erreur lors de la connexion OAuth.",
    OAuthCallback: "Erreur de callback OAuth.",
    OAuthCreateAccount: "Impossible de créer le compte OAuth.",
    EmailCreateAccount: "Impossible de créer le compte email.",
    Callback: "Erreur de callback.",
    OAuthAccountNotLinked: "Ce compte est déjà lié à une autre méthode.",
    EmailSignin: "Erreur lors de l'envoi de l'email.",
    CredentialsSignin: "Identifiants invalides.",
    default: "Une erreur est survenue.",
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-white tracking-tight">
          Connexion
        </h1>
        <p className="text-white/40">
          Bienvenue sur VOIX. Connectez-vous pour accéder à votre dashboard.
        </p>
      </div>

      {/* Error alert */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-sm"
          >
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-400" />
            <div>
              <div className="font-medium mb-1">Erreur de connexion</div>
              {errorMessages[error] || errorMessages.default}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success message */}
      <AnimatePresence>
        {magicLinkSent && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-start gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 text-sm"
          >
            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-400" />
            <div>
              <div className="font-medium mb-1">Lien envoyé</div>
              Vérifiez votre boîte mail ({email}) pour le lien de connexion.
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Social login buttons */}
      <div className="space-y-3">
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => handleSocialSignIn("google")}
          disabled={!!isLoading}
          className="w-full flex items-center justify-center gap-3 bg-white text-slate-900 font-medium py-3.5 rounded-xl hover:bg-white/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading === "google" ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Chrome className="w-5 h-5" />
          )}
          Continuer avec Google
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => handleSocialSignIn("github")}
          disabled={!!isLoading}
          className="w-full flex items-center justify-center gap-3 bg-white/5 border border-white/10 text-white font-medium py-3.5 rounded-xl hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading === "github" ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Github className="w-5 h-5" />
          )}
          Continuer avec GitHub
        </motion.button>
      </div>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-slate-950 px-4 text-white/20 uppercase tracking-wider">
            Ou par email
          </span>
        </div>
      </div>

      {/* Magic link form */}
      <form onSubmit={handleMagicLink} className="space-y-4">
        <div className="relative group">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-indigo-400 transition-colors" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="vous@entreprise.com"
            required
            disabled={magicLinkSent}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 focus:bg-white/10 transition-all disabled:opacity-50"
          />
        </div>

        <motion.button
          type="submit"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          disabled={!!isLoading || magicLinkSent}
          className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/10"
        >
          {isLoading === "magic" ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Envoi en cours...
            </>
          ) : (
            <>
              Envoyer un lien magique
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </motion.button>
      </form>

      {/* Footer */}
      <div className="text-center space-y-4">
        <p className="text-white/30 text-sm">
          Pas encore de compte ?{" "}
          <Link
            href="/auth/signup"
            className="text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
          >
            Créer un compte gratuit
          </Link>
        </p>

        <p className="text-white/20 text-xs">
          En vous connectant, vous acceptez nos{" "}
          <Link
            href="/terms"
            className="underline hover:text-white/40 transition-colors"
          >
            Conditions
          </Link>{" "}
          et{" "}
          <Link
            href="/privacy"
            className="underline hover:text-white/40 transition-colors"
          >
            Politique de confidentialité
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
      }
    >
      <SignInForm />
    </Suspense>
  );
}
