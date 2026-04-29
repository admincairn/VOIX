// ============================================================
// VOIX — Brand Header
// Dynamic brand header for collect form
// ============================================================

import { Building2, ExternalLink } from "lucide-react";

interface Profile {
  company_name?: string;
  logo_url?: string;
  website_url?: string;
}

interface Theme {
  accentColor: string;
  textColor: string;
}

interface Props {
  profile: Profile;
  theme: Theme;
}

export function BrandHeader({ profile, theme }: Props) {
  return (
    <div className="text-center space-y-4">
      {profile.logo_url ? (
        <img
          src={profile.logo_url}
          alt={profile.company_name}
          className="h-12 mx-auto object-contain"
        />
      ) : (
        <div
          className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center"
          style={{ backgroundColor: theme.accentColor + "20" }}
        >
          <Building2 className="w-7 h-7" style={{ color: theme.accentColor }} />
        </div>
      )}

      <div className="space-y-1">
        <h1 className="text-xl font-semibold text-white">Votre avis compte</h1>
        {profile.company_name && (
          <p className="text-white/40 text-sm flex items-center justify-center gap-1.5">
            pour
            <span className="text-white/60 font-medium">
              {profile.company_name}
            </span>
            {profile.website_url && (
              <a
                href={profile.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white/80 transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </p>
        )}
      </div>
    </div>
  );
}
