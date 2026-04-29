// ============================================================
// VOIX — Auth Error Page
// Elegant error handling for auth failures
// ============================================================

"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { AlertTriangle, ArrowLeft, RefreshCcw } from "lucide-react";

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const errorConfig: Record<string, { title: string; description: string }> = {
    Configuration: {
      title: "Erreur de configuration",
      description:
        "Il y a un problème avec la configuration du serveur d'authentification.",
    },
    AccessDenied: {
      title: "Accès refusé",
      description:
        "Vous n'avez pas les permissions nécessaires pour accéder à cette ressource.",
    },
    Verification: {
      title: "Lien expiré",
      description:
        "Le lien de vérification a expiré. Veuillez demander un nouveau lien.",
    },
    OAuthSignin: {
      title: "Erreur OAuth",
      description:
        "Une erreur est survenue lors de la connexion avec le fournisseur externe.",
    },
    OAuthCallback: {
      title: "Erreur de callback",
      description:
        "Une erreur est survenue lors du traitement de la réponse OAuth.",
    },
    OAuthCreateAccount: {
      title: "Création de compte impossible",
      description: "Impossible de créer un compte avec ce fournisseur OAuth.",
    },
    EmailCreateAccount: {
      title: "Création de compte impossible",
      description: "Impossible de créer un compte avec cette adresse email.",
    },
    Callback: {
      title: "Erreur de callback",
      description: "Une erreur est survenue lors du traitement de la réponse.",
    },
    OAuthAccountNotLinked: {
      title: "Compte déjà lié",
      description:
        "Cette adresse email est déjà associée à un autre compte. Veuillez vous connecter avec la méthode originale.",
    },
    EmailSignin: {
      title: "Erreur d'envoi",
      description:
        "Impossible d'envoyer l'email de connexion. Veuillez réessayer.",
    },
    CredentialsSignin: {
      title: "Identifiants invalides",
      description: "L'email ou le mot de passe est incorrect.",
    },
    default: {
      title: "Erreur d'authentification",
      description: "Une erreur inattendue est survenue. Veuillez réessayer.",
    },
  };

  const { title, description } =
    errorConfig[error || ""] || errorConfig.default;

  return (
    <div className="space-y-8 text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="w-20 h-20 mx-auto bg-red-500/10 rounded-2xl flex items-center justify-center"
      >
        <AlertTriangle className="w-10 h-10 text-red-400" />
      </motion.div>

      <div className="space-y-3">
        <h1 className="text-2xl font-semibold text-white">{title}</h1>
        <p className="text-white/40 max-w-sm mx-auto">{description}</p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          href="/auth/signin"
          className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à la connexion
        </Link>

        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl text-white font-medium hover:from-indigo-500 hover:to-violet-500 transition-all"
        >
          <RefreshCcw className="w-4 h-4" />
          Réessayer
        </button>
      </div>
    </div>
  );
}
