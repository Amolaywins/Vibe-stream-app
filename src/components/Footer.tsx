import { useState } from "react";
import { X, Shield, FileText, AlertTriangle } from "lucide-react";

function Modal({ title, icon: Icon, onClose, children }: {
  title: string;
  icon: React.ElementType;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop bg-black/75 p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-lg max-h-[80vh] overflow-y-auto rounded-2xl fade-in" style={{ background: "#111114", border: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/6 sticky top-0" style={{ background: "#111114" }}>
          <div className="flex items-center gap-2">
            <Icon className="w-4 h-4 text-primary" />
            <h2 className="font-semibold text-white text-sm">{title}</h2>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg bg-white/6 hover:bg-white/12 flex items-center justify-center text-white/50 hover:text-white transition-all">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="px-6 py-5 text-sm text-white/50 leading-relaxed space-y-4">{children}</div>
      </div>
    </div>
  );
}

export function Footer() {
  const [open, setOpen] = useState<"terms" | "privacy" | null>(null);

  return (
    <>
      <footer className="px-4 md:px-8 py-6 border-t border-white/5" style={{ background: "rgba(10,10,12,0.6)" }}>
        {/* DMCA Notice */}
        <div className="flex items-start gap-2.5 mb-5 p-3.5 rounded-xl bg-yellow-500/5 border border-yellow-500/10">
          <AlertTriangle className="w-4 h-4 text-yellow-500/70 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-white/30 leading-relaxed">
            <span className="font-semibold text-yellow-500/60">DMCA Notice:</span>{" "}
            VibeStream does not host or store any content. All media is sourced via third-party embeds. We are not responsible for external content.
          </p>
        </div>

        {/* Links + copyright */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <button
              data-testid="btn-terms"
              onClick={() => setOpen("terms")}
              className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white/60 transition-colors"
            >
              <FileText className="w-3 h-3" />
              Terms of Use
            </button>
            <button
              data-testid="btn-privacy"
              onClick={() => setOpen("privacy")}
              className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white/60 transition-colors"
            >
              <Shield className="w-3 h-3" />
              Privacy Policy
            </button>
          </div>
          <p className="text-xs text-white/20">© 2026 VibeStream. All Rights Reserved.</p>
        </div>
      </footer>

      {/* Terms of Use Modal */}
      {open === "terms" && (
        <Modal title="Terms of Use" icon={FileText} onClose={() => setOpen(null)}>
          <p className="text-white/60 font-medium">Last updated: June 2026</p>

          <div>
            <h3 className="text-white/70 font-semibold mb-1.5">1. Acceptance of Terms</h3>
            <p>By accessing or using VibeStream, you agree to be bound by these Terms of Use. If you do not agree with any part of these terms, please discontinue use immediately.</p>
          </div>

          <div>
            <h3 className="text-white/70 font-semibold mb-1.5">2. Nature of the Service</h3>
            <p>VibeStream is an aggregation platform that indexes and embeds publicly available third-party streaming sources. We do not upload, host, store, or distribute any video or audio content. All media content is served directly from third-party servers via embedded iframes.</p>
          </div>

          <div>
            <h3 className="text-white/70 font-semibold mb-1.5">3. Third-Party Content</h3>
            <p>VibeStream has no control over and assumes no responsibility for the content, privacy policies, or practices of any third-party sites or services embedded within this platform. Access to third-party content is at your own risk.</p>
          </div>

          <div>
            <h3 className="text-white/70 font-semibold mb-1.5">4. Intellectual Property</h3>
            <p>All movie and TV show metadata, images, and descriptions are provided by The Movie Database (TMDB) under their respective usage terms. VibeStream's interface design and code are proprietary. Unauthorized reproduction is prohibited.</p>
          </div>

          <div>
            <h3 className="text-white/70 font-semibold mb-1.5">5. DMCA & Copyright</h3>
            <p>VibeStream respects intellectual property rights. If you believe content accessible through our embeds infringes your copyright, please direct your DMCA notice to the respective hosting provider. VibeStream does not host the content and cannot remove it from third-party servers.</p>
          </div>

          <div>
            <h3 className="text-white/70 font-semibold mb-1.5">6. Disclaimer of Warranties</h3>
            <p>The service is provided "as is" and "as available" without warranties of any kind. We do not guarantee uninterrupted access, availability of any specific content, or the accuracy of streaming source availability.</p>
          </div>

          <div>
            <h3 className="text-white/70 font-semibold mb-1.5">7. Limitation of Liability</h3>
            <p>VibeStream and its operators shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the service or inability to access third-party content.</p>
          </div>

          <div>
            <h3 className="text-white/70 font-semibold mb-1.5">8. Modifications</h3>
            <p>We reserve the right to modify these terms at any time. Continued use of VibeStream after changes constitutes acceptance of the revised terms.</p>
          </div>
        </Modal>
      )}

      {/* Privacy Policy Modal */}
      {open === "privacy" && (
        <Modal title="Privacy Policy" icon={Shield} onClose={() => setOpen(null)}>
          <p className="text-white/60 font-medium">Last updated: June 2026</p>

          <div>
            <h3 className="text-white/70 font-semibold mb-1.5">1. Information We Collect</h3>
            <p>VibeStream does not require account registration. We collect no personally identifiable information. All user preferences — including your watchlist, watch history, and settings — are stored exclusively in your browser's localStorage and never transmitted to any server.</p>
          </div>

          <div>
            <h3 className="text-white/70 font-semibold mb-1.5">2. Local Storage</h3>
            <p>Your watchlist and watch history data are saved locally on your device using the Web Storage API. This data remains on your device and is never shared with VibeStream or any third party. Clearing your browser data will remove this information.</p>
          </div>

          <div>
            <h3 className="text-white/70 font-semibold mb-1.5">3. TMDB API</h3>
            <p>VibeStream uses The Movie Database (TMDB) API to fetch movie and TV show metadata, images, and ratings. Your search queries and browsing may be sent to TMDB's servers. Please review TMDB's privacy policy at themoviedb.org for details on their data practices.</p>
          </div>

          <div>
            <h3 className="text-white/70 font-semibold mb-1.5">4. Third-Party Embeds</h3>
            <p>When you play content via an embedded player, you connect directly to third-party streaming servers. These third parties may collect information such as your IP address, device type, and viewing behavior in accordance with their own privacy policies. VibeStream has no control over this data collection.</p>
          </div>

          <div>
            <h3 className="text-white/70 font-semibold mb-1.5">5. Cookies</h3>
            <p>VibeStream itself does not set cookies. However, third-party embedded players may set cookies or use tracking technologies on their own domains when content is played. You can configure your browser to block third-party cookies.</p>
          </div>

          <div>
            <h3 className="text-white/70 font-semibold mb-1.5">6. Analytics</h3>
            <p>We do not currently use any analytics services. No usage data, page views, or behavioral tracking is collected or stored by VibeStream.</p>
          </div>

          <div>
            <h3 className="text-white/70 font-semibold mb-1.5">7. Children's Privacy</h3>
            <p>VibeStream is not directed at children under 13. We do not knowingly collect any data from children. If you believe a child has shared information through our platform, please contact us and we will take appropriate action.</p>
          </div>

          <div>
            <h3 className="text-white/70 font-semibold mb-1.5">8. Changes to This Policy</h3>
            <p>We may update this Privacy Policy periodically. Any changes will be reflected here with an updated date. Your continued use of VibeStream after changes constitutes acceptance of the revised policy.</p>
          </div>
        </Modal>
      )}
    </>
  );
}
