"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { DelegatoHorizontalLogo } from "@/components/ui/DelegatoBrand";
import { ArrowLeft, Shield, FileText } from "lucide-react";

export default function TermsAndConditionsPage() {
  useEffect(() => {
    document.title = "Terms & Conditions | Delegato";
  }, []);

  return (
    <div className="min-h-screen bg-[#0B1B33] text-neutral-200 font-sans antialiased selection:bg-[#FFD23F] selection:text-[#0B1B33]">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-[#0B1B33]/90 backdrop-blur-md border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group" aria-label="Delegato Home">
            <DelegatoHorizontalLogo className="h-7 w-auto" />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-neutral-300 hover:text-[#FFD23F] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Delegato</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        {/* Document Header Card */}
        <div className="bg-[#1560BD]/20 border border-[#1560BD]/40 rounded-3xl p-6 sm:p-10 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFD23F]/10 border border-[#FFD23F]/30 text-[#FFD23F] text-xs font-bold uppercase tracking-wider mb-4">
            <Shield className="w-3.5 h-3.5" />
            <span>Legal Agreement</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-heading font-extrabold text-white tracking-tight leading-tight">
            Terms & Conditions of Service
          </h1>
          <p className="mt-3 text-sm sm:text-base text-neutral-300">
            <strong>Effective Date:</strong> 10 November 2026 &nbsp;|&nbsp; <strong>Last Updated:</strong> 10 November 2026
          </p>
          <div className="mt-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-400/30 text-amber-200 text-xs sm:text-sm leading-relaxed">
            <strong>Important Legal Notice:</strong> Please read these Terms and Conditions carefully. By accessing, browsing, registering for an account, organizing an event, or submitting an attendee application on Delegato, you acknowledge that you have read, understood, and agree to be legally bound by this agreement in its entirety. If you do not agree, you must immediately cease using the platform.
          </div>
        </div>

        {/* Legal Text Body */}
        <article className="prose prose-invert max-w-none space-y-10 text-neutral-300 text-sm sm:text-base leading-relaxed">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-white border-b border-white/10 pb-2">
              1. Identity of the Proprietorship & The Platform
            </h2>
            <p>
              This website, digital platform, mobile web application, and related software solutions (collectively, the <strong>&ldquo;Platform&rdquo;</strong> or <strong>&ldquo;Delegato&rdquo;</strong>) are owned, administered, and operated by <strong>Shwaans Gaba</strong>, acting as a sole proprietor under the business name <strong>Delegato</strong> (unregistered sole proprietorship under the laws of India, hereinafter referred to as the <strong>&ldquo;Proprietor&rdquo;</strong>, <strong>&ldquo;We&rdquo;</strong>, <strong>&ldquo;Us&rdquo;</strong>, or <strong>&ldquo;Our&rdquo;</strong>).
            </p>
            <p>
              Official legal communication and grievance correspondence can be directed to: <br />
              <strong>Contact Email:</strong> <a href="mailto:sankalpdigitech@gmail.com" className="text-[#FFD23F] underline">sankalpdigitech@gmail.com</a> <br />
              <strong>Operating Jurisdiction:</strong> New Delhi, National Capital Territory of Delhi, India.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-white border-b border-white/10 pb-2">
              2. Contractual Nature & Acceptance of Terms
            </h2>
            <p>
              These Terms and Conditions constitute a legally binding electronic contract between you (the <strong>&ldquo;User&rdquo;</strong>, whether acting as an individual attendee, delegate, faculty advisor, school representative, student, or conference organizer) and the Proprietor, formulated in compliance with the <strong>Indian Contract Act, 1872</strong>, the <strong>Information Technology Act, 2000</strong>, and rules framed thereunder as amended from time to time.
            </p>
            <p>
              By tapping &ldquo;Register&rdquo;, &ldquo;Sign In&rdquo;, &ldquo;Organize an MUN&rdquo;, &ldquo;Publish Conference&rdquo;, or checking any corresponding acceptance box, you affirmatively manifest your intent to enter into this contract electronically without requiring physical signature.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-white border-b border-white/10 pb-2">
              3. Eligibility, Minors & Explicit Parental / Guardian Consent
            </h2>
            <p>
              The Platform hosts educational simulations, Model United Nations conferences, academic debates, and youth leadership forums that frequently involve students in secondary and senior-secondary schools (typically classes 6 through 12, who are minors under the age of 18 years under the <strong>Majority Act, 1875</strong>).
            </p>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5 space-y-2">
              <h3 className="font-heading font-bold text-white text-base">
                Mandatory Minor Representation & Parental Consent Warranty:
              </h3>
              <p className="text-xs sm:text-sm text-neutral-300">
                If an attendee or delegate registering on Delegato is under 18 years of age:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-neutral-300">
                <li>
                  The minor user and the user&apos;s legal parent or guardian expressly warrant and represent that the parent or legal guardian has reviewed and approved these Terms &amp; Conditions and gives full consent for the minor&apos;s participation, data submission, and registration.
                </li>
                <li>
                  Submission of an application by or on behalf of a minor shall constitute an irrefutable legal warranty that parental or guardian consent has been obtained prior to entering any personal data or payment details.
                </li>
                <li>
                  The parent or legal guardian accepts full financial, legal, and behavioral responsibility for the minor&apos;s use of the Platform and attendance at the respective event.
                </li>
                <li>
                  Delegato and the Proprietor disclaim any and all liability for registrations executed without parental consent, and the responsibility to verify minor authorization lies exclusively between the student&apos;s legal guardians and the event organizer.
                </li>
              </ul>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-white border-b border-white/10 pb-2">
              4. Intermediary Status & Platform Role (Safe Harbor Protection)
            </h2>
            <p>
              <strong>Delegato is strictly a technical intermediary and SaaS software provider</strong> under Section 2(1)(w) of the <strong>Information Technology Act, 2000</strong>. Delegato provides digital infrastructure, allotment visualization matrices, forms, and conference workflow management tools.
            </p>
            <p className="text-neutral-200">
              <strong>What Delegato is NOT:</strong>
            </p>
            <ul className="list-disc pl-5 space-y-2 text-neutral-300">
              <li>
                Delegato is <strong>not an organizer, promoter, partner, joint venturer, employer, agent, or sponsor</strong> of any Model United Nations, conference, or student event hosted on or discovered through the Platform.
              </li>
              <li>
                Delegato exercises <strong>no editorial, physical, operational, or administrative control</strong> over the event venues, physical security, executive boards, study guides, award decisions, cafeteria food, transport, lodging, or on-ground safety of any conference.
              </li>
              <li>
                The publication of a conference on Delegato does not constitute an endorsement, guarantee, accreditation, or verification of the organizer or the event.
              </li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-white border-b border-white/10 pb-2">
              5. Dual Payment Architecture, Fee Handling & Complete Refund Disclaimer
            </h2>
            <p>
              Conferences listed on Delegato may utilize either direct off-platform payments (such as peer-to-peer UPI transfers, direct school bank remittances, or cash-on-desk) or integrated electronic payment gateways facilitated via third-party processors.
            </p>
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-5 space-y-3 text-neutral-200">
              <h3 className="font-heading font-bold text-red-300 text-base">
                Critical Financial & Refund Exclusions:
              </h3>
              <ol className="list-decimal pl-5 space-y-2 text-xs sm:text-sm text-neutral-300">
                <li>
                  <strong>Independent Financial Relationship:</strong> The delegate registration fee, delegation deposit, or team fee is set exclusively by the independent event organizer. When a delegate pays, the contractual arrangement for event service delivery is solely between the attendee and the organizer.
                </li>
                <li>
                  <strong>Absolute Disclaimers of Refund Liability:</strong> In no circumstance shall Delegato or the Proprietor be liable, responsible, or obligated to issue refunds, chargebacks, reversals, or financial indemnities for any event cancellations, postponement, shift in venue, committee cancellation, executive board changes, dissatisfaction with awards, or technical failure on the part of the organizing institution.
                </li>
                <li>
                  <strong>Disputes Regarding Payments:</strong> Any dispute regarding delegate fees, unauthorized UPI transactions, false payment proof uploads, or refund requests must be settled directly between the attendee (or their parent/school) and the conference secretariat. Delegato holds no escrow funds on behalf of attendees.
                </li>
                <li>
                  <strong>Platform Charges:</strong> Any platform access fees, software licenses, or subscription fees paid by organizers to Delegato are strictly non-refundable upon commencement of service or database initialization.
                </li>
              </ol>
            </div>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-white border-b border-white/10 pb-2">
              6. Portfolio Allotment Matrix & Organizer Discretion
            </h2>
            <p>
              Delegato equips secretariats with software tools, interactive seat matrix views, queue management, and automated allotment engines.
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-neutral-300">
              <li>
                <strong>No Guarantee of Desired Country or Committee:</strong> Delegates submit ranked preferences (e.g., UNSC Brazil, DISEC France). The Platform and the Proprietor do not warrant or guarantee that any applicant will receive their first, second, or third preference.
              </li>
              <li>
                <strong>Finality of Organizer Decisions:</strong> All portfolio allotments, reassignments, waitlists, or disqualifications are within the exclusive, unreviewable discretion of the conference organizing committee. Delegato has zero authority to overturn or alter an allotment decision.
              </li>
              <li>
                <strong>Portfolio Deletions & Schema Updates:</strong> If an organizer deletes, merges, or re-titles a portfolio or committee within their database, the Platform displays such assigned entries as &ldquo;NIL&rdquo; or unassigned. Delegato bears no liability for structural modifications made by organizers to their matrices.
              </li>
            </ul>
          </section>

          {/* Section 7 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-white border-b border-white/10 pb-2">
              7. Organizer Responsibilities, Representations & Warranties
            </h2>
            <p>
              Any person, school, college, society, or student body creating, managing, or publishing a conference on Delegato represents, warrants, and covenants that:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-neutral-300">
              <li>
                They possess valid legal authority, institutional permissions, administrative sanctions, and venue rights to organize the specified conference.
              </li>
              <li>
                They shall be solely responsible for the safety, child protection, medical emergencies, sexual harassment prevention (POSH compliance where applicable), and physical security of all participants at their venue.
              </li>
              <li>
                All agendas, background guides, study materials, and committee assets uploaded to Delegato do not infringe upon third-party copyrights, trademarks, or proprietary rights.
              </li>
              <li>
                They shall maintain truthfulness in fee structures, venue addresses, city classifications, and shall promptly update delegates of any schedule changes.
              </li>
              <li>
                They shall strictly indemnify and hold harmless Delegato and Shwaans Gaba from any claims, suits, or liabilities initiated by attendees, venues, police authorities, or schools related to their conference.
              </li>
            </ul>
          </section>

          {/* Section 8 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-white border-b border-white/10 pb-2">
              8. Prohibited Platform Conduct & Account Sanctions
            </h2>
            <p>
              Users shall not engage in any of the following prohibited activities:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-neutral-300">
              <li>Submitting fraudulent, fictitious, defamatory, or deceptive registration records.</li>
              <li>Uploading forged payment receipts, fake transaction IDs, or manipulated UPI screenshots.</li>
              <li>Interfering with, disrupting, or reverse-engineering platform source code, APIs, databases, or client-side bundles.</li>
              <li>Using automated bots, web crawlers, scrapers, or scripts to harvest participant information or spam conference rosters.</li>
              <li>Posting hate speech, obscenity, harassment, or unauthorized promotional material on committee agendas or conference cards.</li>
            </ul>
            <p>
              Delegato reserves the unreserved right to investigate, immediately suspend, disable, or permanently delete any organizer or delegate account found violating these provisions without prior notice, liability, or refund.
            </p>
          </section>

          {/* Section 9 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-white border-b border-white/10 pb-2">
              9. Intellectual Property Rights & License Grant
            </h2>
            <p>
              All software, source code, visual styles, card aesthetics, iconography, layout architectures, the Delegato trademark, and the Delegato brand logo are the exclusive intellectual property of <strong>Shwaans Gaba</strong> and are protected under Indian and international intellectual property laws.
            </p>
            <p>
              By uploading conference banners, school emblems, committee logos, or background guide documents, organizers grant Delegato a non-exclusive, worldwide, royalty-free license to host, display, resize, distribute, and process such assets solely for the purpose of operating the Platform.
            </p>
          </section>

          {/* Section 10 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-white border-b border-white/10 pb-2">
              10. Data Processing, Privacy & Intermediary Transmission
            </h2>
            <p>
              Delegato processes personal data (such as full names, email addresses, phone numbers, school affiliations, classes, and portfolio preferences) strictly for executing registrations, generating status tracking cards, and assisting secretariats with roll-calls and allotment matrices, in harmony with the <strong>Digital Personal Data Protection Act, 2023 (DPDP Act)</strong>.
            </p>
            <p>
              Delegates acknowledge that when registering for an event, their submitted details are made accessible to the organizers of that specific event. Delegato holds no responsibility for how independent event organizers handle, store, or communicate with delegates outside the Delegato platform.
            </p>
          </section>

          {/* Section 11 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-white border-b border-white/10 pb-2">
              11. Disclaimer of Warranties
            </h2>
            <p className="uppercase text-xs sm:text-sm tracking-wide text-neutral-300 bg-neutral-900/60 p-4 rounded-2xl border border-white/10">
              The Platform is provided strictly on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis without warranties of any kind, whether express, statutory, or implied, including but not limited to implied warranties of merchantability, fitness for a particular academic purpose, non-infringement, uptime, or error-free operation. We do not warrant that the platform will be uninterrupted, virus-free, secure, or that any conference will proceed as scheduled.
            </p>
          </section>

          {/* Section 12 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-white border-b border-white/10 pb-2">
              12. Strict Limitation of Liability (Maximum Comprehensive Protection)
            </h2>
            <div className="bg-neutral-900/80 border border-neutral-700 p-5 rounded-2xl space-y-3 text-neutral-300">
              <p>
                To the fullest extent permitted by applicable law, in no event shall <strong>Shwaans Gaba</strong>, Delegato, their successors, assigns, agents, contractors, or developers be liable under any legal theory (whether in contract, tort, negligence, strict liability, or otherwise) for:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
                <li>Any indirect, special, incidental, punitive, exemplary, or consequential damages whatsoever;</li>
                <li>Loss of profits, loss of anticipated revenue, loss of academic opportunity, travel expenditure, accommodation expenses, or reputational damage;</li>
                <li>Physical injuries, accidents, illnesses, food poisoning, harassment, or disputes occurring at any event venue or during travel to/from an event;</li>
                <li>Unauthorized access, alteration, or deletion of user data resulting from third-party interception or client security breach;</li>
                <li>Cancellation, truncation, or poor quality of any conference or educational simulation.</li>
              </ul>
              <p className="font-bold text-white text-xs sm:text-sm">
                In all events, the total cumulative liability of Shwaans Gaba and Delegato to any user for all claims arising out of or related to the use of the platform shall be strictly limited to the lower of: (A) INR ₹1,000 (One Thousand Indian Rupees), or (B) the net software fee actually collected and retained by Delegato directly from that specific user in the preceding 30 days.
              </p>
            </div>
          </section>

          {/* Section 13 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-white border-b border-white/10 pb-2">
              13. Complete User Indemnification
            </h2>
            <p>
              You agree to defend, indemnify, and hold harmless <strong>Shwaans Gaba</strong>, Delegato, and associated technical operators from and against any and all claims, damages, liabilities, losses, judgments, awards, fines, and expenses (including reasonable attorneys&apos; fees and court costs) arising out of or resulting from:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-neutral-300">
              <li>Your breach or alleged breach of any provision of these Terms;</li>
              <li>Your registration, attendance, conduct, or disputes with any conference organizer, school, fellow delegate, or parent;</li>
              <li>Any event organized, advertised, or published by you on the Platform;</li>
              <li>Your infringement of any intellectual property or privacy rights of any third party;</li>
              <li>Failure to obtain requisite parental or guardian permissions for minor attendees.</li>
            </ul>
          </section>

          {/* Section 14 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-white border-b border-white/10 pb-2">
              14. Dispute Resolution, Arbitration & Exclusive Jurisdiction
            </h2>
            <p>
              <strong>Governing Law:</strong> These Terms and Conditions shall be governed by, construed, and enforced exclusively in accordance with the substantive and procedural laws of the <strong>Republic of India</strong>, without regard to conflict of law principles.
            </p>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5 space-y-2 text-xs sm:text-sm">
              <h3 className="font-heading font-bold text-white text-base">
                Two-Step Dispute Escalation Procedure:
              </h3>
              <p>
                <strong>1. Informal Amicable Resolution:</strong> In the event of any controversy, claim, or dispute arising out of or relating to these Terms, the parties shall first attempt in good faith to resolve the dispute amicably by sending written notice to <a href="mailto:sankalpdigitech@gmail.com" className="text-[#FFD23F] underline">sankalpdigitech@gmail.com</a> for a period of not less than thirty (30) business days.
              </p>
              <p>
                <strong>2. Binding Sole Arbitration:</strong> If the dispute cannot be settled amicably within thirty (30) days, it shall be finally resolved by binding arbitration administered by a Sole Arbitrator appointed mutually or in accordance with the <strong>Arbitration and Conciliation Act, 1996</strong> (as amended). The seat, place, and venue of arbitration shall be <strong>New Delhi, India</strong>, and proceedings shall be conducted in English.
              </p>
              <p>
                <strong>Exclusive Court Jurisdiction:</strong> Subject to the arbitration clause above, the competent courts located exclusively in <strong>New Delhi, Delhi, India</strong> shall have exclusive subject-matter and territorial jurisdiction over all matters and interim reliefs arising hereunder.
              </p>
            </div>
          </section>

          {/* Section 15 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-white border-b border-white/10 pb-2">
              15. Statutory Grievance Redressal Mechanism
            </h2>
            <p>
              In satisfaction of Rule 3(2) of the <strong>Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021</strong>, the details of the designated Grievance Officer are set forth below:
            </p>
            <div className="p-4 rounded-2xl bg-[#1560BD]/15 border border-[#1560BD]/30 space-y-1 text-xs sm:text-sm text-neutral-300">
              <p><strong className="text-white">Designated Officer:</strong> Shwaans Gaba (Proprietor)</p>
              <p><strong className="text-white">Trade Entity:</strong> Delegato (Sole Proprietorship)</p>
              <p><strong className="text-white">Email Address:</strong> <a href="mailto:sankalpdigitech@gmail.com" className="text-[#FFD23F] underline">sankalpdigitech@gmail.com</a></p>
              <p><strong className="text-white">Grievance Response Window:</strong> Acknowledgment within 24 hours; disposal/redressal within 15 days of receipt.</p>
            </div>
          </section>

          {/* Section 16 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-white border-b border-white/10 pb-2">
              16. Modifications & Severability
            </h2>
            <p>
              The Proprietor reserves the unilateral right to amend, update, or revise these Terms at any time by publishing the amended version on the Platform. Your continued use of the Platform after any revisions constitutes binding acceptance of the updated Terms.
            </p>
            <p>
              If any provision of these Terms is deemed unlawful, void, or for any reason unenforceable, that provision shall be deemed severable from these Terms and shall not affect the validity and enforceability of any remaining provisions.
            </p>
          </section>
        </article>

        {/* Bottom Footer Callout */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-neutral-400">
          <p>© {new Date().getFullYear()} Delegato (Proprietor: Shwaans Gaba). All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Link href="/conferences" className="hover:text-white transition-colors">Conferences</Link>
            <Link href="/login" className="hover:text-white transition-colors">Organizer Login</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
