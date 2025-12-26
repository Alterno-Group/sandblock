import Link from "next/link";

/**
 * Site footer with links to Privacy Policy, Terms of Service, and copyright
 */
export const Footer = () => {
  return (
    <footer className="border-t border-card-border bg-base-200/30 py-6 md:py-8 mt-12">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
          {/* Links */}
          <div className="flex items-center gap-4 sm:gap-6 text-sm">
            <Link
              href="/privacy-policy"
              className="text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              Privacy Policy
            </Link>
            <span className="text-muted-foreground">|</span>
            <Link
              href="/terms-of-service"
              className="text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              Terms of Service
            </Link>
          </div>

          {/* Divider on mobile */}
          <div className="sm:hidden border-t border-card-border w-12"></div>

          {/* Copyright */}
          <p className="text-xs sm:text-sm text-muted-foreground text-center">
            © 2025 SANDBLŌCK. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
